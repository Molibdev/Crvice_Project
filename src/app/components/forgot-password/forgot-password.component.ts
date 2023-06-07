import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  credenciales = {
    correo: '',
    password: '',
  };

  constructor(private auth: AuthService) {}

  
   //Método para restablecer la contraseña.
   
  async resetPassword() {
    this.auth
      .resetPass(this.credenciales.correo)
      .then(() => {
        // Email de recuperación de contraseña enviado con éxito
        console.log('Email de recuperación de contraseña enviado');
      })
      .catch((error) => {
        // Error al enviar el correo electrónico de recuperación de contraseña
        console.log('Error al enviar el correo electrónico de recuperación de contraseña', error);
      });
  }

  ngOnInit(): void {}
}
