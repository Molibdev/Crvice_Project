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

  publicacion?: Publicacion; // Variable que almacena los datos de la publicación actual
  usuarioLogueado: boolean = false; // Variable para controlar si el usuario ha iniciado sesión
  averageRating: number = 0; // Variable para almacenar la calificación promedio
  contador: number = 1; // Contador utilizado para cargar más comentarios
  mostrarCargarMenos: boolean = false; // Indicador para mostrar el botón de cargar menos comentarios
  ratings: Calificacion[] = []; // Arreglo que almacena las calificaciones y comentarios
  mostrarCargarMas: boolean = true; // Indicador para mostrar el botón de cargar más comentarios
  public imagenPredeterminada = '../../../assets/img/foto5.jpg'; // Ruta de la imagen predeterminada
  user$ = this.firebase.currentUserProfile$; // Observable que representa el perfil del usuario actual
  searchControl = new FormControl(''); // Control para la búsqueda de usuarios
  public fotos: string[] = []; // Arreglo que almacena las URLs de las fotos
  fotoActual: string | undefined; // URL de la foto actualmente mostrada en la galería
  indiceFotoActual: number = 0; // Índice de la foto actual en la galería
  numeroPerfil: number = 0; // Número de perfil del usuario actual

  // Observable que combina varios flujos de datos para filtrar usuarios según un término de búsqueda y el usuario actual.
  users$ = combineLatest([this.firebase.allUsers$, this.user$, this.searchControl.valueChanges.pipe(startWith(''))]).pipe(
    map(([users, user, searchString]) => users.filter(u => u.nombre?.toLowerCase().includes(searchString?.toLowerCase() ?? '') && u.uid !== user?.uid))
  );

  // Control de formulario utilizado para manejar una lista de chats.
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
      if (user) {
        const numeroPerfil = user.perfil; // Corregir la propiedad a "perfil"
        // Aquí puedes hacer uso del número de perfil como desees
        console.log('Número de perfil del usuario logueado:', numeroPerfil);
        this.numeroPerfil = numeroPerfil; // Asignar el número de perfil al componente
      }
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
            } else {
              this.fotoActual = this.imagenPredeterminada;
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
  
  // Crear chat con otro usuario
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

  // Enviar solicitud de trabajo
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

  // Mostrar la imagen anterior de la publicacion
  mostrarImagenAnterior() {
    this.indiceFotoActual--;
    if (this.indiceFotoActual < 0) {
      this.indiceFotoActual = this.fotos.length - 1;
    }
    this.fotoActual = this.fotos[this.indiceFotoActual];
  }

  // Mostrar la imagen siguiente de la publicacion
  mostrarImagenSiguiente() {
    this.indiceFotoActual++;
    if (this.indiceFotoActual >= this.fotos.length) {
      this.indiceFotoActual = 0;
    }
    this.fotoActual = this.fotos[this.indiceFotoActual];
  }

  // Calcular la calificacion promedio
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

 // Cargar mas comentarios
  cargarMasComentarios() {
    this.contador += 5;
    this.mostrarCargarMenos = true;
  
    if (this.contador >= this.ratings.length) {
      this.mostrarCargarMas = false;
    }
  }

  // Cargar menos comentarios
  cargarMenosComentarios() {
    this.contador = 1;
    this.mostrarCargarMas = true;
  
  }
}
