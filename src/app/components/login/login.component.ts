import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  credenciales = {
    correo: '',
    password: '',
  }

  constructor(
    private auth: AuthService,
    private interaction: InteractionService,
    private router: Router,
    private toast: HotToastService
  ) {}

  ngOnInit() {
    // Método que se ejecuta al inicializar el componente
  }

  // Método para iniciar sesión
  async login() {
    console.log('credenciales ->', this.credenciales);
    
    // Verificar si se ingresó correo y contraseña
    if (this.credenciales.correo === '' || this.credenciales.password === '') {
      this.toast.error('Por favor, ingresa correo y contraseña');
      return;
    }
    
    try {
      // Realizar el inicio de sesión
      const res = await this.auth.login(this.credenciales.correo, this.credenciales.password);
  
      if (res && res.user?.emailVerified) {
        // Verificar si el correo está verificado y redirigir al perfil
        console.log('res ->', res);
        this.router.navigate(['/profile']);
      } else if (res) {
        // Redirigir a la página de validación de correo electrónico
        this.router.navigate(['/email-validation']);
      } else {
        // Credenciales incorrectas, mostrar mensaje de error y redirigir a la página de inicio de sesión
        this.toast.error('Correo o contraseña incorrecto');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      // Error en el inicio de sesión, mostrar mensaje de error y redirigir a la página de inicio de sesión
      this.toast.error('Correo o contraseña incorrecto');
      console.error(error);
      this.router.navigate(['/login']);
    }
  }
}
