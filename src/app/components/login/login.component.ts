import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { InteractionService } from 'src/app/services/interaction.service';


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
              private router: Router) {}
              
  ngOnInit(){

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



}


