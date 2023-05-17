import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    comuna: '',
    nacimiento: new Date(),
    calificaciones: 0,
    comentarios: '',
  }


  comunas = [
    'Cerrillos',
    'Cerro Navia',
    'Conchalí',
    'El Bosque',
    'Estación Central',
    'Huechuraba',
    'Independencia',
    'La Cisterna',
    'La Florida',
    'La Granja',
    'La Pintana',
    'La Reina',
    'Las Condes',
    'Lo Barnechea',
    'Lo Espejo',
    'Lo Prado',
    'Macul',
    'Maipú',
    'Ñuñoa',
    'Padre Hurtado',
    'Pedro Aguirre Cerda',
    'Peñalolén',
    'Pirque',
    'Providencia',
    'Pudahuel',
    'Puente Alto',
    'Quilicura',
    'Quinta Normal',
    'Recoleta',
    'Renca',
    'San Bernardo',
    'San Joaquín',
    'San José de Maipo',
    'San Miguel',
    'San Ramón',
    'Santiago'
  ];
  

  constructor(private auth: AuthService,
              private firestore: FirebaseService,
              private router: Router,
              private fb: FormBuilder) {}


  public formRegister: FormGroup= this.fb.group({
    nombre:['',[Validators.required] ],
    apellido:['', [Validators.required]],
    rut:['', [Validators.required, Validators.min(0),Validators.pattern(/^\d+$/)]],
    dv:['', [Validators.required, Validators.min(0),Validators.maxLength(1)]],
    correo:['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    password:['',[Validators.required, Validators.minLength(6)]],
    perfil:['', [Validators.required]],
    telefono:['', [Validators.required, Validators.minLength(7),Validators.pattern(/^\d+$/)]],
    direccion:['',[Validators.required]],
    comuna:['',[Validators.required]],
    nacimiento:['',[Validators.required]],
  })


  ngOnInit(): void {
    
  }

  isValidField( field: string ): boolean | null {
    return this.formRegister.controls[field].errors
      && this.formRegister.controls[field].touched;
  }

  getFieldError( field: string ): string | null {

    if ( !this.formRegister.controls[field] ) return null;

    const errors = this.formRegister.controls[field].errors || {};

    for (const key of Object.keys(errors) ) {
      switch( key ) {
        case 'required':
          return 'Este campo es requerido';
        case 'minlength':
          return `Mínimo ${ errors['minlength'].requiredLength } caracters.`;
        case 'maxlength':
          return `Máximo ${ errors['maxlength'].requiredLength } caracters.`;
        case'min':
          return 'Debe ser un número positivo';
        case 'pattern':
          return 'Debe ser su formato correcto';
      }
    }

    return null;
  }

  async registrar() {
    if ( this.formRegister.invalid ) {
      this.formRegister.markAllAsTouched();
      return;
    }
  
    console.log(this.datos);
    
    this.datos.nombre = this.formRegister.get('nombre')?.value;
    this.datos.apellido = this.formRegister.get('apellido')?.value;
    this.datos.rut = this.formRegister.get('rut')?.value;
    this.datos.dv = this.formRegister.get('dv')?.value;
    this.datos.correo = this.formRegister.get('correo')?.value;
    this.datos.password = this.formRegister.get('password')?.value;
    this.datos.perfil = this.formRegister.get('perfil')?.value;
    this.datos.telefono = this.formRegister.get('telefono')?.value;
    this.datos.direccion = this.formRegister.get('direccion')?.value;
    this.datos.comuna = this.formRegister.get('comuna')?.value;
    this.datos.nacimiento = this.formRegister.get('nacimiento')?.value;
    

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

    this.formRegister.reset();
  }



}
