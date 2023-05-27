import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { Publicacion } from 'src/app/models/publicacion';
import { InteractionService } from 'src/app/services/interaction.service';
import { Calificacion, User } from 'src/app/models/models';
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
  usuarioLogueado: boolean = false; // Variable para controlar si el usuario ha iniciado sesión
  averageRating: number = 0; // Variable para almacenar la calificación promedio
  contador: number = 1;
  mostrarCargarMenos: boolean = false;
  ratings: Calificacion[] = [];
  mostrarCargarMas: boolean = true;

  user$ = this.firebase.currentUserProfile$;
  searchControl = new FormControl('');
  public fotos: string[] = [];
  fotoActual: string | undefined; // URL de la foto actualmente mostrada
  indiceFotoActual: number = 0; // Índice de la foto actual

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
    // Verificar si el usuario ha iniciado sesión
    this.firebase.currentUserProfile$.subscribe(user => {
      this.usuarioLogueado = !!user;
    });
  
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.publicacionesService.getPublicacion(id).subscribe(publicacion => {
        this.publicacion = publicacion;
        localStorage.setItem('publicacionId', id);
  
        // Obtener las URL de las fotos
        this.firebase.getFotosURL(publicacion.uid, id).subscribe(urls => {
          Promise.all(urls).then(resolvedUrls => {
            this.fotos = resolvedUrls;
  
            if (this.fotos.length > 0) {
              this.fotoActual = this.fotos[0];
            }
          });
        });
  
        // Obtener las calificaciones y comentarios
        const path = `Usuarios/${publicacion.uid}/calificaciones`;
        this.firebase.getCollection<Calificacion>(path).subscribe(calificaciones => {
          this.ratings = calificaciones;
        });
  
        // Calcular la calificación promedio
        this.calculateAverageRating(publicacion.uid);
      });
    }
  }
  

  createChat(otherUser: User) {
    this.chat
      .isExistingChat(otherUser?.uid)
      .pipe(
        switchMap(chatId => {
          if (chatId) {
            return of(chatId);
          } else {
            return this.chat.createChat(otherUser);
          }
        })
      )
      .subscribe(chatId => {
        this.chatListControl.setValue([chatId]);
      });
    this.router.navigate(['/chat']);
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

  mostrarImagenAnterior() {
    this.indiceFotoActual--;
    if (this.indiceFotoActual < 0) {
      this.indiceFotoActual = this.fotos.length - 1;
    }
    this.fotoActual = this.fotos[this.indiceFotoActual];
  }

  mostrarImagenSiguiente() {
    this.indiceFotoActual++;
    if (this.indiceFotoActual >= this.fotos.length) {
      this.indiceFotoActual = 0;
    }
    this.fotoActual = this.fotos[this.indiceFotoActual];
  }

  calculateAverageRating(uid: string) {
    const path = `Usuarios/${uid}/calificaciones`;
    this.firebase
      .getCollection<Calificacion>(path)
      .subscribe(calificaciones => {
        const ratings = calificaciones;
        let totalRating = 0;
        for (const rating of ratings) {
          totalRating += +rating.calificacion; // Convertir a número utilizando el prefijo '+'
        }
        console.log('Calificación Total:', totalRating);
        console.log('Cantidad de Calificaciones:', ratings.length);
        this.averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
        console.log('Calificación Promedio:', this.averageRating);
      });
  }

  cargarMasComentarios() {
    this.contador += 5;
    this.mostrarCargarMenos = true;
  
    if (this.contador >= this.ratings.length) {
      this.mostrarCargarMas = false;
    }
  }
  cargarMenosComentarios() {
    this.contador = 1;
    this.mostrarCargarMas = true;
  
  }
}
