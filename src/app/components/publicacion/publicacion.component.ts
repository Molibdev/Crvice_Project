import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicacionesService } from 'src/app/services/publicaciones.service'; 
import { Publicacion } from 'src/app/models/publicacion'; 
import { InteractionService } from 'src/app/services/interaction.service';
import { User } from 'src/app/models/models';
import { combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { FormControl } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-publicacion',
  templateUrl: './publicacion.component.html',
  styleUrls: ['./publicacion.component.css']
})
export class PublicacionComponent implements OnInit {
  publicacion?: Publicacion;

  user$ = this.firebase.currentUserProfile$;
  searchControl = new FormControl('');
  public fotos: string[] = [];

  users$ = combineLatest([this.firebase.allUsers$, this.user$, this.searchControl.valueChanges.pipe(startWith(''))]).pipe(
    map(([users, user, searchString]) => users.filter(u => u.nombre?.toLowerCase().includes(searchString?.toLowerCase() ?? '') && u.uid !== user?.uid))
  );

  chatListControl = new FormControl<string[]>([]);

  constructor(
    private route: ActivatedRoute,
    private publicacionesService: PublicacionesService,
    private chat: InteractionService,
    private router: Router,
    private firebase: FirebaseService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.publicacionesService.getPublicacion(id).subscribe(publicacion => {
        this.publicacion = publicacion;
        localStorage.setItem('publicacionId', id);
      // Obtener las URL de las fotos
      this.firebase.getFotosURL(publicacion.uid, id).subscribe(urls => {
        Promise.all(urls).then(resolvedUrls => {
          this.fotos = resolvedUrls;
        });
      });
    });
  }
  }

  createChat(otherUser: User) {
    this.chat.isExistingChat(otherUser?.uid).pipe(
      switchMap(chatId => {
        if (chatId) {
          return of(chatId);
        } else {
          return this.chat.createChat(otherUser);
        }
      })
    ).subscribe(chatId => {
      this.chatListControl.setValue([chatId]);
    })
    this.router.navigate(['/chat'])
  }


  solicitarTrabajo() {
    const id = this.publicacion?.id;
    const uid = this.publicacion?.uid;
    this.firebase.getCurrentUserUid().subscribe(currentUserUid => {
      console.log('id:', id);
      console.log('uid:', uid);
      console.log('currentUserUid:', currentUserUid);
      this.router.navigate(['/solicitar-trabajo', id, uid, currentUserUid]);
    });
  }
}