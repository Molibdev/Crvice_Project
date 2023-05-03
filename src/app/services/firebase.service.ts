import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { collectionData, query, Firestore } from '@angular/fire/firestore';
import {
  doc,
  docData,
} from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import { from, Observable, of, switchMap } from 'rxjs';
import { User } from '../models/models';
import { AuthService } from 'src/app/services/auth.service';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore:AngularFirestore,
              private fstore: Firestore,
              private authService: AuthService) { }

  createDoc(data: any, path: string, id:string) {
    const collection = this.firestore.collection(path);
    return collection.doc(id).set(data);
  }

  getId() {
    return this.firestore.createId();
  }

  getCollection<tipo>(path: string) {

    const collection = this.firestore.collection<tipo>(path);
    return collection.valueChanges();

  }

  getDoc<tipo>(path: string, id: string){
    return this.firestore.collection(path).doc<tipo>(id).valueChanges();
  }

  updateDoc(path: string, id: string, data: any){
    return this.firestore.collection(path).doc(id).update(data)
  }

  get allUsers$(): Observable<User[]> {
    const ref = collection(this.fstore, 'Usuarios');
    const queryAll = query(ref);
    return collectionData(queryAll) as Observable<User[]>;
  }

  get currentUserProfile$(): Observable<User | null> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user?.uid) {
          return of(null);
        }

        const ref = doc(this.fstore, 'Usuarios', user?.uid);
        return docData(ref) as Observable<User>;
      })
    );
  }
  
  getUserName(): Observable<string> {
    return this.currentUserProfile$.pipe(
      map((user) => `${user?.nombre} ${user?.apellido}`)
    );
  }

}
