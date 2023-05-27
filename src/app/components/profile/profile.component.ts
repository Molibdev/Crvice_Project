import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UploadImageService } from 'src/app/services/upload-image.service';
import { UsersService } from 'src/app/services/users.service';
import { catchError, combineLatest, map, of, startWith, switchMap, tap, throwError } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';
import { Calificacion } from 'src/app/models/models';
import { InteractionService } from 'src/app/services/interaction.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  uid: string = ''
  info: User | null = null;
  user$ = this.usersService.currentUserProfile$;
  searchControl = new FormControl('');
  users$ = combineLatest([this.firestore.allUsers$, this.user$, this.searchControl.valueChanges.pipe(startWith(''))]).pipe(
    map(([users, user, searchString]) => users.filter(u => u.nombre?.toLowerCase().includes(searchString?.toLowerCase() ?? '') && u.uid !== user?.uid))
  );

  ratings: Calificacion[] = [];
  contador: number = 1;
  mostrarCargarMenos: boolean = false;
  mostrarCargarMas: boolean = true;
  averageRating: number = 0;
  showContainer: boolean = false;

  nombre: string = '';
  apellido: string = '';
  rut: string = '';
  dv: string = '';
  correo: string = '';
  telefono: string = '';
  direccion: string = '';
  nacimiento: string = '';
  perfil: string = '';
  mostrarDialogo: boolean = false;
  editingField: string = '';
  chatListControl = new FormControl<string[]>([]);
  adminId : string = '6VD9LeSM0qSBwP0AsyhylOZDMIx2'
  public isLoading: boolean = false;

  constructor(private auth: AuthService,
              private router: Router,
              private firestore: FirebaseService,
              private imageUploadService: UploadImageService,
              private usersService: UsersService,
              private toast: HotToastService,
              private chat: InteractionService) {

  }


  async ngOnInit() {
    this.isLoading = true;
    console.log('estoy en perfil');
    this.uid = (await this.auth.getUid()) || '';
    console.log('uid ->', this.uid);
    // Retraso de 2 segundos (2000 milisegundos)
    setTimeout(() => {
      this.showContainer = true;
      this.getInfoUser();
      this.auth.stateUser().subscribe(res =>
        console.log('en perfil - estado de autentificacion ->', res)
      );
    }, 500);
  }

  onCustomPromptSave(value: string) {
    if (this.editingField === 'telefono') {
      this.saveTelefono(value);
    } 
    

    // Cerrar el prompt
    this.closePrompt();
  }

  

  mostrarPrompt(field: string) {
    this.editingField = field;
    this.mostrarDialogo = true;
  }

  closePrompt() {
    this.mostrarDialogo = false;
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


  async getInfoUser() {
    const path = 'Usuarios';
    const id = this.uid;
    this.firestore.getDoc<User>(path, id).subscribe(res => {
      if (res) {
        this.info = res;
        this.getCalificaciones();
      }
      console.log('datos son ->', res);
      this.isLoading = false;
    });
  }
  
  getCalificaciones() {
    const path = `Usuarios/${this.uid}/calificaciones`;
    this.firestore.getCollection<Calificacion>(path).subscribe(calificaciones => {
      this.ratings = calificaciones;
      this.calculateAverageRating();
    });
  }
  
  calculateAverageRating() {
    let totalRating = 0;
    for (const rating of this.ratings) {
      totalRating += +rating.calificacion; // Convertir a número utilizando el prefijo '+'
    }
    console.log('Calificación Total:', totalRating);
    console.log('Cantidad de Calificaciones:', this.ratings.length);
    this.averageRating = totalRating / this.ratings.length;
    console.log('Calificación Promedio:', this.averageRating);
  }
  


  saveTelefono(telefono: string) {
    const path = 'Usuarios';
    const id = this.uid;
    const updateDoc = { telefono };
    this.firestore.updateDoc(path, id, updateDoc).then(() => {
      console.log('Telefono actualizado con éxito');
    });
  }

  async resetPassword() {
    const path = 'Usuarios';
    const id = this.uid;
    this.firestore.getDoc<User>(path, id).subscribe(res => {
      if (res) {
        this.info = res;
        if (this.info?.correo) {
          this.auth.resetPass(this.info.correo)
            .then(() => {
              // Email de recuperación de contraseña enviado
              console.log('Email de recuperación de contraseña enviado');
            })
            .catch((error) => {
              // Error al enviar el correo electrónico de recuperación de contraseña
              console.log('Error al enviar el correo electrónico de recuperación de contraseña', error);
            });
        }
      }
      console.log('datos son ->', res);
    });
  }

  uploadFile(event: any, user: User) {
    const { uid } = user;
    const upload$ = this.imageUploadService.uploadImage(event.target.files[0], `images/profile/${uid}`);
  
    const loading$ = of(null).pipe(
      tap(() => {
        this.toast.loading('Cargando imagen...', { duration: 2000 });
      })
    );
  
    loading$
      .pipe(
        switchMap(() =>
          upload$.pipe(
            switchMap((photoURL) =>
              this.usersService.updateUser({
                ...user,
                photoURL: photoURL,
              }).pipe(
                tap(() => {
                  this.toast.success('Imagen cargada con éxito!');
                }),
                catchError((error) => {
                  this.toast.error('Ha ocurrido un error al subir la imagen');
                  return throwError(error);
                })
              )
            ),
            catchError(() => of(null)) // Evita que se propague el error de carga y permite que continúe con el flujo
          )
        )
      )
      .subscribe();
  }

  logout() {
    this.auth.logout();
    console.log('se ha cerrado la sesion')
    this.router.navigate(['/login'])
  }


  crearPublicacion(){
    this.router.navigate(['/nueva-publicacion'])
  }

  verMisPublicaciones() {
    this.router.navigate(['/mis-publicaciones']);
  }

  verMisSolicitudes() {
    this.router.navigate(['/solicitudes']);
  }

  verMisContrataciones() {
    this.router.navigate(['/contrataciones']);
  }
  gestPublicaciones() {
    this.router.navigate(['/gestionar-publicaciones']);
  }

  cargarMasComentarios() {
    this.contador += 5;
    this.mostrarCargarMenos = true;
    if (this.contador==this.ratings.length-1){
      this.mostrarCargarMas = false;
    }

  }
  cargarMenosComentarios() {
    if (this.contador=1){
      this.mostrarCargarMenos = false;
      this.mostrarCargarMas = true;
    }
  }
}
