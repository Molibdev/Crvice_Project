import { Injectable } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { User } from '../models/models';
import { Observable, concatMap, map, take } from 'rxjs';
import { Timestamp, addDoc, collection, doc, query, updateDoc, where } from '@angular/fire/firestore';
import { FirebaseService } from './firebase.service';
import { Chat, Message } from '../models/chats';
import { orderBy } from 'firebase/firestore';



@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  constructor(private firestore: Firestore, private firebase: FirebaseService ) { }

  createChat(otherUser: User): Observable<string>{
    const ref = collection(this.firestore, 'chats');
    console.log('paso')
    return this.firebase.currentUserProfile$.pipe(
      take(1), 
      concatMap(user => addDoc(ref, {
        userIds: [user?.uid, otherUser?.uid],
        users: [
          {
            nombre: user?.nombre ?? '',
            apellido: user?.apellido ?? '',
          },
          {
            nombre: otherUser?.nombre ?? '',
            apellido: otherUser?.apellido ?? '',
          },
        ]
      })),
      map( ref => ref.id)
    )
  }

  get myChats$(): Observable<Chat[]> {
    const ref = collection(this.firestore, 'chats');
    return this.firebase.currentUserProfile$.pipe(
      concatMap((user) => {
      const myQuery = query(ref, where('userIds', 'array-contains', user?.uid));
      return collectionData(myQuery, { idField: 'id'}).pipe(
        map(chats => this.addChatNameAndPic(user?.uid ?? '', chats as Chat[]))
      ) as Observable<Chat[]>;
      })
    );
  }

  isExistingChat(otherUserId: string): Observable<string | null>{
    return this.myChats$.pipe(
      take(1),
      map(chats => {

        for(let i=0; i < chats.length; i++){
          if(chats[i].userIds.includes(otherUserId)){
            return chats[i].id;
          }
        }

        return null;
      })
    );
  }

  addChatMessage(chatId: string, message: string): Observable<any> {
    const ref = collection(this.firestore, 'chats', chatId, 'messages');
    const chatRef = doc(this.firestore, 'chats', chatId);
    const today = Timestamp.fromDate(new Date());
    return this.firebase.currentUserProfile$.pipe(
      take(1),
      concatMap((user) =>
        addDoc(ref, {
          text: message,
          senderId: user?.uid,
          sentDate: today,
        })
      ),
      concatMap(() =>
        updateDoc(chatRef, { lastMessage: message, lastMessageDate: today })
      )
    );
  }

  getChatMessages$(chatId: string): Observable<Message[]>{
    const ref = collection(this.firestore, 'chats', chatId, 'messages');
    const queryAll = query(ref, orderBy('sentDate', 'asc'))
    return collectionData(queryAll) as Observable<Message[]>
  }

  addChatNameAndPic(currentUserId: string, chats: Chat[]): Chat[] {
    chats.forEach(chat => {
      const otherIndex = chat.userIds.indexOf(currentUserId) === 0 ? 1 : 0;
      const {nombre, apellido} = chat.users[otherIndex];
      chat.chatName = nombre
      chat.chatLastName = apellido
    })

    return chats;
  }

}
