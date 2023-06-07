import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-email-validation',
  templateUrl: './email-validation.component.html',
  styleUrls: ['./email-validation.component.css']
})
export class EmailValidationComponent implements OnInit {
  correo: string = ''; // Correo electrónico del usuario
  uid: string = ''; // UID del usuario
  info: User | null = null; // Información del usuario

  constructor(
    private auth: AuthService,
    private router: Router,
    private firestore: FirebaseService
  ) {}

  async ngOnInit() {
    console.log('estoy en perfil');
    this.uid = (await this.auth.getUid()) || '';
    console.log('uid ->', this.uid);
    this.getInfoUser();
    this.auth.stateUser().subscribe(res => console.log('en perfil - estado de autentificacion ->', res));
  }

 
  // Método para obtener la información del usuario desde Firestore.
  
  getInfoUser() {
    const path = 'Usuarios';
    const id = this.uid;
    this.firestore.getDoc<User>(path, id).subscribe(res => {
      if (res) {
        this.info = res;
      }
      console.log('datos son ->', res);
    });
  }

  
  // Método para enviar el correo electrónico de verificación.
  
  verificationEmail() {
    this.auth.verificationEmail();
    console.log('Email de verificación enviado');
  }
}
