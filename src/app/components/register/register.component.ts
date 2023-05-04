import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{

  datos: User = {
    uid: '', 
    nombre: '',
    apellido: '',
    rut: 0,
    dv: '',
    correo: '',
    password: '',
    perfil: 0,
    telefono: 0,
    direccion: '',
    nacimiento: new Date(),
    calificaciones: 0,
    comentarios: '',
  }
  

  constructor(private auth: AuthService,
              private firestore: FirebaseService,
              private router: Router) {}

  ngOnInit(): void {
    
  }

  async registrar() {
    console.log('datos ->', this.datos);
    const res = await this.auth.register(this.datos).catch( res =>  {
      console.log('error')
    })
    if (res && res.user) {
      const path = 'Usuarios';
      const id = res.user.uid;
      this.datos.uid = id;
      this.datos.password = '';
      await this.firestore.createDoc(this.datos, path, id)
      localStorage.setItem('correo', this.datos.correo);
      this.router.navigate(['/email-validation'])
    }
  }



}
