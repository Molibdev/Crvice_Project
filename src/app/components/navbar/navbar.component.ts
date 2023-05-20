import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
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

  info: User | null = null;
  user$ = this.usersService.currentUserProfile$;
  showLoginButton = false;
  uid: string = ''


  credenciales = {
    correo: '',
    password: '',
  }

  constructor( private usersService: UsersService,
               private firestore: FirebaseService,
               private auth: AuthService,
               private authfirebase: AngularFireAuth,
               private router: Router){
              
  }

  async ngOnInit() {
    setTimeout(() => {
      this.showLoginButton = true;
    }, 1500); 
    this.uid = (await this.auth.getUid()) || '';
    this.getInfoNavbar();
  }

  async login() {
    console.log('credenciales ->', this.credenciales);
    const res = await this.auth.login(this.credenciales.correo, this.credenciales.password)
    if (res && res.user?.emailVerified){
      console.log('res ->', res);
      this.router.navigate(['/profile'])
    } else if (res) {
      this.router.navigate(['/email-validation'])
    } else{
      this.router.navigate(['/login'])
    }
  }

  async getInfoNavbar() {
    const path = 'Usuarios';
    const id = this.uid;
    this.firestore.getDoc<User>(path, id).subscribe( res => {
      if (res) {
        this.info = res;
        console.log(this.info.perfil)
      }
  })
  }

  async resetPassword() {
    const path = 'Usuarios';
    const user = await this.authfirebase.currentUser;
    const id = user?.uid;
    
    if (id) {
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
    } else {
      console.log('No user ID available.');
    }
  }

  

  logout() {
    this.auth.logout();
    console.log('se ha cerrado la sesion')
    this.router.navigate(['/login'])
  }

}
