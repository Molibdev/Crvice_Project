import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { User } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  info: User | null = null; // Información del usuario actual
  user$ = this.usersService.currentUserProfile$; // Observable del perfil de usuario actual
  showLoginButton = false; // Bandera para mostrar el botón de inicio de sesión
  uid: string = ''; // ID del usuario actual obtenido del almacenamiento local

  credenciales = {
    correo: '',
    password: '',
  }; // Credenciales de inicio de sesión

  constructor(
    private usersService: UsersService,
    private firestore: FirebaseService,
    private auth: AuthService,
    private authfirebase: AngularFireAuth,
    private router: Router,
    private toast: HotToastService,
  ) {}

  async ngOnInit() {
    setTimeout(() => {
      this.showLoginButton = true;
    }, 1500);

    this.uid = this.getUidFromLocalStorage() || ''; // Obtener el ID del usuario del almacenamiento local
  }

  async login() {
    // Iniciar sesión con las credenciales proporcionadas
    console.log('credenciales ->', this.credenciales);
    try {
      const res = await this.auth.login(
        this.credenciales.correo,
        this.credenciales.password
      );
      if (res && res.user?.emailVerified) {
        console.log('res ->', res);
        this.router.navigate(['/profile']);
        this.toast.success('¡Bienvenido!');
      } else if (res) {
        this.router.navigate(['/email-validation']);
        this.toast.info('¡Por favor, verifica tu cuenta antes de ingresar!');
      } else {
        this.router.navigate(['/index']);
        this.toast.error(
          'Error al iniciar sesión, correo o contraseña incorrectos...'
        );
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.router.navigate(['/index']);
      this.toast.error(
        'Error al iniciar sesión, correo o contraseña incorrectos...'
      );
    }
  }

  async getInfoNavbar() {
    // Obtener la información del usuario actual para mostrar en la barra de navegación
    const path = 'Usuarios';
    const id = this.uid;
    this.firestore.getDoc<User>(path, id).subscribe((res) => {
      if (res) {
        this.info = res;
        console.log(this.info.perfil);
      }
    });
  }

  async resetPassword() {
    // Restablecer la contraseña del usuario actual
    const path = 'Usuarios';
    const user = await this.authfirebase.currentUser;
    const id = user?.uid;

    if (id) {
      this.firestore.getDoc<User>(path, id).subscribe((res) => {
        if (res) {
          this.info = res;
          if (this.info?.correo) {
            this.auth
              .resetPass(this.info.correo)
              .then(() => {
                // Email de recuperación de contraseña enviado
                console.log('Email de recuperación de contraseña enviado');
                this.toast.success(
                  '¡Te enviamos un correo electrónico para el cambio de tu contraseña!'
                );
              })
              .catch((error) => {
                // Error al enviar el correo electrónico de recuperación de contraseña
                console.log(
                  'Error al enviar el correo electrónico de recuperación de contraseña',
                  error
                );
                this.toast.error('Error al enviar correo de cambio de contraseña...');
              });
          }
        }
        console.log('datos son ->', res);
      });
    } else {
      console.log('No user ID available.');
    }
  }

  logout() {
    // Cerrar sesión del usuario actual
    this.auth.logout();
    console.log('se ha cerrado la sesion');
    this.toast.info('Cerrando sesión...');
    this.router.navigate(['/index']);
  }

  private getUidFromLocalStorage(): string | null {
    // Obtener el ID del usuario almacenado en el almacenamiento local
    return localStorage.getItem('uid');
  }

  private saveUidToLocalStorage(uid: string) {
    // Guardar el ID del usuario en el almacenamiento local
    localStorage.setItem('uid', uid);
  }
}
