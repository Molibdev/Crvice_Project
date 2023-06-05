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

  constructor(private auth: AuthService,
              private interaction: InteractionService,
              private router: Router,
              private toast: HotToastService
              ) {}
              
  ngOnInit(){

  }

  async login() {
    console.log('credenciales ->', this.credenciales);
    
    if (this.credenciales.correo === '' || this.credenciales.password === '') {
      this.toast.error('Por favor, ingresa correo y contraseña');
      return;
    }
    
    try {
      const res = await this.auth.login(this.credenciales.correo, this.credenciales.password);
  
      if (res && res.user?.emailVerified) {
        console.log('res ->', res);
        this.router.navigate(['/profile']);
      } else if (res) {
        this.router.navigate(['/email-validation']);
      } else {
        // Credenciales incorrectas, mostrar toast
        this.toast.error('Correo o contraseña incorrecto');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      // Error en el inicio de sesión, mostrar toast
        this.toast.error('Correo o contraseña incorrecto');
      console.error(error);
      this.router.navigate(['/login']);
    }
  }
  
  



}


