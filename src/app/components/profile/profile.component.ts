import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UploadImageService } from 'src/app/services/upload-image.service';
import { UsersService } from 'src/app/services/users.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { switchMap, tap } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  uid: string = ''
  info: User | null = null;
  ratings = [];
  user$ = this.usersService.currentUserProfile$;
  
  nombre: string = '';
  apellido: string = '';
  rut: string = '';
  dv: string = '';
  correo: string = '';
  telefono: string = '';
  direccion: string = '';
  nacimiento: string = '';
  perfil: string = '';

  constructor(private auth: AuthService,
              private router: Router,
              private firestore: FirebaseService,
              private imageUploadService: UploadImageService,
              private usersService: UsersService,
              private toast: HotToastService) {

  }


  async ngOnInit() {
    console.log('estoy en perfil')
    this.uid = (await this.auth.getUid()) || '';
    console.log('uid ->', this.uid);
    this.getInfoUser();
    this.auth.stateUser().subscribe(res => 
      console.log('en perfil - estado de autentificacion ->', res));
  }


 async getInfoUser() {
    const path = 'Usuarios';
    const id = this.uid;
    this.firestore.getDoc<User>(path, id).subscribe( res => {
      if (res) {
        this.info = res;
      }
      console.log('datos son ->', res);
  })
  }

  

  mostrarPromptNombre() {
    const nombre = prompt("Ingrese Nombre para actualizar:");
    if (nombre != null) {
      console.log("El usuario ingresó el valor: " + nombre);
      const usuario = { nombre: nombre };
      this.saveNombre(usuario);
    }
  }

  saveNombre(usuario: any){
    const path = 'Usuarios';
    const id = this.uid;
    const updateDoc = {
      nombre: usuario.nombre
    };
    this.firestore.updateDoc(path, id, updateDoc).then( () => {
      console.log('Nombre Actualizado con exito')
    })
  }

  mostrarPromptApellido() {
    const apellido = prompt("Ingrese Apellido para actualizar:");
    if (apellido != null) {
      console.log("El usuario ingresó el valor: " + apellido);
      const usuario = { apellido: apellido };
      this.saveApellido(usuario);
    }
  }

  saveApellido(usuario: any){
    const path = 'Usuarios';
    const id = this.uid;
    const updateDoc = {
      apellido: usuario.apellido
    };
    this.firestore.updateDoc(path, id, updateDoc).then( () => {
      console.log('Apellido actualizado con exito')
    })
  }

  mostrarPromptTelefono() {
    const telefono = prompt("Ingrese Nuevo Telefono");
    if (telefono != null) {
      console.log("El usuario ingresó el valor: " + telefono);
      const usuario = { telefono: telefono };
      this.saveTelefono(usuario);
    }
  }

  saveTelefono(usuario: any){
    const path = 'Usuarios';
    const id = this.uid;
    const updateDoc = {
      telefono: usuario.telefono
    };
    this.firestore.updateDoc(path, id, updateDoc).then( () => {
      console.log('Telefono actualizado con exito')
    })
  }

  mostrarPromptDireccion() {
    const direccion = prompt("Ingrese Nueva Direccion:");
    if (direccion != null) {
      console.log("El usuario ingresó el valor: " + direccion);
      const usuario = { direccion: direccion };
      this.saveDireccion(usuario);
    }
  }

  saveDireccion(usuario: any){
    const path = 'Usuarios';
    const id = this.uid;
    const updateDoc = {
      direccion: usuario.direccion
    };
    this.firestore.updateDoc(path, id, updateDoc).then( () => {
      console.log('Direccion actualizada con exito')
    })
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
    this.imageUploadService
      .uploadImage(event.target.files[0], `images/profile/${uid}`)
      .pipe(
        this.toast.observe({
          loading: 'Uploading profile image...',
          success: 'Image uploaded successfully',
          error: 'There was an error in uploading the image',
        }),
        switchMap((photoURL) =>
          this.usersService.updateUser({
            ...user,
            photoURL: photoURL,
          })
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

}
