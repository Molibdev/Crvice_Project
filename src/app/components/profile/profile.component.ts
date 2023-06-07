import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UploadImageService } from 'src/app/services/upload-image.service';
import { UsersService } from 'src/app/services/users.service';
import { catchError, combineLatest, map, of, startWith, switchMap, tap, throwError } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';
import { Calificacion, userDataBank } from 'src/app/models/models';
import { InteractionService } from 'src/app/services/interaction.service';
import { FormControl } from '@angular/forms';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  // Propiedades del componente
  uid: string = ''; // ID del usuario actual
  info: User | null = null; // Información del usuario
  user$ = this.usersService.currentUserProfile$; // Observable que emite el perfil del usuario actual
  searchControl = new FormControl(''); // Control para buscar usuarios
  users$ = combineLatest([this.firestore.allUsers$, this.user$, this.searchControl.valueChanges.pipe(startWith(''))]).pipe(
    map(([users, user, searchString]) => users.filter(u => u.nombre?.toLowerCase().includes(searchString?.toLowerCase() ?? '') && u.uid !== user?.uid))
  ); // Observable que emite la lista de usuarios filtrados

  ratings: Calificacion[] = []; // Lista de calificaciones del usuario
  datosBanco: userDataBank[] = []; // Datos bancarios del usuario
  contador: number = 1; // Contador para controlar la cantidad de comentarios cargados
  mostrarCargarMenos: boolean = false; // Indicador para mostrar/ocultar el botón de cargar menos comentarios
  mostrarCargarMas: boolean = true; // Indicador para mostrar/ocultar el botón de cargar más comentarios
  averageRating: number = 0; // Promedio de calificaciones del usuario
  showContainer: boolean = false; // Indicador para mostrar/ocultar el contenedor principal
  idCuentaTrans: string = ''; // ID de la cuenta de transferencia seleccionada
  mostrarConfirmacion: boolean = false; // Indicador para mostrar/ocultar la confirmación de eliminación

  nombre: string = ''; // Nombre del usuario
  apellido: string = ''; // Apellido del usuario
  rut: string = ''; // Rut del usuario
  dv: string = ''; // Dígito verificador del rut del usuario
  correo: string = ''; // Correo electrónico del usuario
  telefono: string = ''; // Teléfono del usuario
  direccion: string = ''; // Dirección del usuario
  nacimiento: string = ''; // Fecha de nacimiento del usuario
  perfil: string = ''; // Perfil del usuario
  mostrarDialogo: boolean = false; // Indicador para mostrar/ocultar el diálogo de edición
  editingField: string = ''; // Campo que se está editando en el diálogo
  chatListControl = new FormControl<string[]>([]); // Control de la lista de chats del usuario
  adminId: string = '6VD9LeSM0qSBwP0AsyhylOZDMIx2'; // ID del administrador
  public isLoading: boolean = false; // Indicador de carga en progreso
  ratingsCount: number = 0; // Cantidad de calificaciones del usuario

  constructor(
    private auth: AuthService,
    private router: Router,
    private firestore: FirebaseService,
    private imageUploadService: UploadImageService,
    private usersService: UsersService,
    private toast: HotToastService,
    private chat: InteractionService
  ) {}

  // Método de inicialización del componente
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

  // Método para guardar un valor editado en el prompt personalizado
  onCustomPromptSave(value: string) {
    if (this.editingField === 'telefono') {
      this.saveTelefono(value);
    }
    // Cerrar el prompt
    this.closePrompt();
  }

  // Método para mostrar el prompt personalizado
  mostrarPrompt(field: string) {
    this.editingField = field;
    this.mostrarDialogo = true;
  }

  // Método para cerrar el prompt personalizado
  closePrompt() {
    this.mostrarDialogo = false;
  }

  // Método para crear un chat con otro usuario
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
    });
    this.router.navigate(['/chat']);
  }

  // Método para obtener la información del usuario actual
  async getInfoUser() {
    const path = 'Usuarios';
    const id = this.uid;
    this.firestore.getDoc<User>(path, id)
      .pipe(
        take(1) // Toma solo el primer valor emitido
      )
      .subscribe(res => {
        if (res) {
          this.info = res;
          this.getCalificaciones(); // Llamada solo a getCalificaciones()
          this.getUserDataBank(); // Llamada a getUserDataBank()
        }
        console.log('datos son ->', res);
        this.isLoading = false;
      });
  }

  // Método para obtener los datos bancarios del usuario
  getUserDataBank() {
    const path = `Usuarios/${this.uid}/DatosTransferencia`;
    this.firestore.getCollection<userDataBank>(path).subscribe(userDataBank => {
      this.datosBanco = userDataBank;
      if (this.datosBanco.length > 0) {
        this.idCuentaTrans = this.datosBanco[0].IdCuenta; // Guardar el primer número de cuenta en idCuentaTrans
      }
    });
  }

  // Método para borrar los datos bancarios del usuario
  borrarDatosBank(docId: string) {
    this.idCuentaTrans = docId;
    this.firestore.borrarDatosTransferencia(this.uid, docId)
      .then(() => {
        console.log('Datos eliminados exitosamente');
        // Puedes agregar aquí alguna lógica adicional después de eliminar los datos
      })
      .catch((error: any) => {
        console.log('Error al eliminar los datos:', error);
      });
    this.mostrarConfirmacion = false;
    this.toast.warning('Se han eliminado los datos de transferencia de tu cuenta');
  }

  // Método para mostrar la confirmación de borrado de datos bancarios
  confirmarBorrarDatos(): void {
    this.mostrarConfirmacion = true;
  }

  // Método para cancelar el borrado de datos bancarios
  cancelarBorrarDatos(): void {
    this.mostrarConfirmacion = false;
  }

  // Método para obtener las calificaciones del usuario
  getCalificaciones() {
    const path = `Usuarios/${this.uid}/calificaciones`;
    this.firestore.getCollection<Calificacion>(path).subscribe(calificaciones => {
      const newRatingsCount = calificaciones.length;
      const newAverageRating = this.calculateAverageRating(calificaciones);

      // Redondear el nuevo promedio a dos decimales
      const roundedAverageRating = Number(newAverageRating.toFixed(2));

      if (newRatingsCount !== this.ratingsCount || roundedAverageRating !== this.averageRating) {
        this.ratings = calificaciones;
        this.ratingsCount = newRatingsCount;
        this.averageRating = roundedAverageRating;

        const updateDoc = {
          NumeroCalificaciones: this.ratingsCount,
          PromedioCalificaciones: this.averageRating
        };
        this.firestore.updateDoc('Usuarios', this.uid, updateDoc)
          .then(() => {
            console.log('Datos de calificaciones actualizados con éxito en el documento de Usuarios');
          })
          .catch((error: any) => {
            console.log('Error al actualizar los datos de calificaciones:', error);
          });
      }
    });
  }

  // Método para calcular el promedio de las calificaciones
  calculateAverageRating(ratings: Calificacion[]) {
    let totalRating = 0;
    for (const rating of ratings) {
      totalRating += +rating.calificacion; // Convertir a número utilizando el prefijo '+'
    }
    return ratings.length > 0 ? totalRating / ratings.length : 0;
  }

  // Método para guardar el número de teléfono editado
  saveTelefono(telefono: string) {
    const path = 'Usuarios';
    const id = this.uid;
    const updateDoc = { telefono };
    this.firestore.updateDoc(path, id, updateDoc).then(() => {
      console.log('Telefono actualizado con éxito');
      this.telefono = telefono; // Asignar el nuevo valor a la propiedad `telefono` del componente
      this.info!.telefono = Number(telefono); // Convertir a número y asignar el nuevo valor a la propiedad `telefono` del objeto `this.info`
    });
  }

  // Método para restablecer la contraseña del usuario
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
    });
  }

  // Método para cambiar la imagen de perfil del usuario
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

  // Método para cerrar la sesión del usuario
  logout() {
    this.auth.logout();
    console.log('se ha cerrado la sesion')
    this.router.navigate(['/login'])
  }

  // Método para ir a la pagina nueva publicacion
  crearPublicacion(){
    this.router.navigate(['/nueva-publicacion'])
  }

  // Método para ir a la pagina mis publicaciones
  verMisPublicaciones() {
    this.router.navigate(['/mis-publicaciones']);
  }

 // Método para ir a la pagina mis solicitudes
  verMisSolicitudes() {
    this.router.navigate(['/solicitudes']);
  }

 // Método para ir a la pagina mis contrataciones
  verMisContrataciones() {
    this.router.navigate(['/contrataciones']);
  }

 // Método para ir a la pagina gestionar publicaciones
  gestPublicaciones() {
    this.router.navigate(['/gestionar-publicaciones']);
  }

 // Método para ir a la pagina crud admin
  gestUsers() {
    this.router.navigate(['/crud-admin']);
  }

 // Método para cargar mas comentarios
  cargarMasComentarios() {
    this.contador += 5;
    this.mostrarCargarMenos = true;
  
    if (this.contador >= this.ratings.length) {
      this.mostrarCargarMas = false;
    }
  }

  // Método para cargar menos comentarios
  cargarMenosComentarios() {
    this.contador = 1;
    if(this.contador=1){
      this.mostrarCargarMenos=false;
    }
    this.mostrarCargarMas = true;
  
  }
}
