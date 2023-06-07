import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { Message } from 'src/app/models/chats';
import { User } from 'src/app/models/models';
import { FirebaseService } from 'src/app/services/firebase.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  @ViewChild('endOfChat') endOfChat!: ElementRef;

  // Observable que representa al usuario actual
  user$ = this.firebase.currentUserProfile$;

  // Control para la búsqueda de usuarios
  searchControl = new FormControl('');

  // Control para el mensaje actual
  messageControl = new FormControl('');

  // Control para la lista de chats seleccionados
  chatListControl = new FormControl<string[]>([]);

  // Observable que representa los mensajes en el chat actual
  messages$: Observable<Message[]> | undefined;

  // Observable que representa a todos los usuarios, filtrados según la búsqueda
  users$ = combineLatest([this.firebase.allUsers$, this.user$, this.searchControl.valueChanges.pipe(startWith(''))]).pipe(
    map(([users, user, searchString]) =>
      users.filter(u => u.nombre?.toLowerCase().includes(searchString?.toLowerCase() ?? '') && u.uid !== user?.uid)
    )
  );

  // Observable que representa los chats del usuario actual
  myChats$ = this.chatService.myChats$;

  // Observable que representa el chat seleccionado actualmente
  selectedChat$ = combineLatest([
    this.chatListControl.valueChanges,
    this.myChats$,
  ]).pipe(
    map(([value, chats]) => {
      if (value && value.length > 0) {
        return chats.find((c) => c.id === value[0]);
      } else {
        return null;
      }
    })
  );

  constructor(
    private firebase: FirebaseService,
    private chatService: InteractionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Observable que se suscribe a los cambios en la lista de chats seleccionados
    this.messages$ = this.chatListControl.valueChanges.pipe(
      map(value => value ? value[0] : null),
      switchMap(chatId => chatId ? this.chatService.getChatMessages$(chatId) : of([])),
      tap(() => {
        this.scrollToBottom();
      })
    );
  }

  // Crea un nuevo chat con otro usuario
  createChat(otherUser: User) {
    this.chatService.isExistingChat(otherUser?.uid).pipe(
      switchMap(chatId => {
        if (chatId) {
          return of(chatId);
        } else {
          return this.chatService.createChat(otherUser);
        }
      })
    ).subscribe(chatId => {
      this.chatListControl.setValue([chatId]);
    });
  }

  // Envía un mensaje al chat actual
  sendMessage() {
    const message = this.messageControl.value;
    const selectedChatId = this.chatListControl.value ? this.chatListControl.value[0] : null;
    if (message && selectedChatId) {
      this.chatService.addChatMessage(selectedChatId, message).subscribe(() => {
        this.scrollToBottom();
      });
      this.messageControl.setValue('');
    }
  }

  // Desplaza el scroll hasta el final del chat
  scrollToBottom() {
    setTimeout(() => {
      if (this.endOfChat) {
        this.endOfChat.nativeElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }
}
