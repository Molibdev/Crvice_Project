import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { User } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{

  // Datos del usuario a registrar
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
    numDireccion: 0,
    comuna: '',
    nacimiento: new Date(),
  }

  // Lista de comunas disponibles
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
  

  constructor(
    private auth: AuthService,
    private firestore: FirebaseService,
    private router: Router,
    private fb: FormBuilder,
    private toast: HotToastService
  ) {}


//Validación formulario
public formRegister: FormGroup = this.fb.group({
  nombre: ['', [Validators.required]],
  apellido: ['', [Validators.required]],
  rut: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
  dv: ['', [Validators.required, Validators.min(0), Validators.maxLength(1)]],
  correo: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  confirmarPassword: ['', [Validators.required]],
  perfil: ['', [Validators.required]],
  telefono: ['', [Validators.required, Validators.minLength(7), Validators.pattern(/^\d+$/)]],
  direccion: ['', [Validators.required]],
  numDireccion: ['', [Validators.required, Validators.min(1), Validators.maxLength(7)]],
  comuna: ['', [Validators.required]],
  nacimiento: ['', [Validators.required]],
}, { validators: this.passwordMatchValidator });


  ngOnInit(): void {
    
  }

//Valida que contraseña y validar contraseña sean iguales
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmarPassword')?.value;
  
    if (password !== confirmPassword) {
      control.get('confirmarPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
  
    return null;
  }

//Valida que el formulario tiene errores y a sido tocado
  isValidField( field: string ): boolean | null {
    return this.formRegister.controls[field].errors
      && this.formRegister.controls[field].touched;
  }

//Verifica el tipo de error para mostrar en pantalla
  getFieldError( field: string ): string | null {

    if ( !this.formRegister.controls[field] ) return null;

    const errors = this.formRegister.controls[field].errors || {};

    for (const key of Object.keys(errors) ) {
      switch( key ) {
        case 'required':
          return 'Este campo es requerido.';
        case 'minlength':
          return `Mínimo ${ errors['minlength'].requiredLength } caracteres.`;
        case 'maxlength':
          return `Máximo ${ errors['maxlength'].requiredLength } caracteres.`;
        case'min':
          return 'Debe ser un número positivo.';
        case 'pattern':
          return 'Debe ser su formato correcto.';
      }
    }

    return null;
  }

//Registro de Usuario
  async registrar() {
    if ( this.formRegister.invalid ) {
      this.formRegister.markAllAsTouched();
      return;
    }
  
    console.log(this.datos);

    // Asignación de valores del formulario al objeto "datos"
    this.datos.nombre = this.formRegister.get('nombre')?.value;
    this.datos.apellido = this.formRegister.get('apellido')?.value;
    this.datos.rut = this.formRegister.get('rut')?.value;
    this.datos.dv = this.formRegister.get('dv')?.value;
    this.datos.correo = this.formRegister.get('correo')?.value;
    this.datos.password = this.formRegister.get('password')?.value;
    this.datos.perfil = this.formRegister.get('perfil')?.value;
    this.datos.telefono = this.formRegister.get('telefono')?.value;
    this.datos.direccion = this.formRegister.get('direccion')?.value;
    this.datos.numDireccion = this.formRegister.get('numDireccion')?.value;
    this.datos.comuna = this.formRegister.get('comuna')?.value;
    this.datos.nacimiento = this.formRegister.get('nacimiento')?.value;

    if(!this.mayorDeEdad(this.datos.nacimiento)){
      this.toast.error(
        'Error, debe ser mayor de edad para registrarse.'
      );
      return;
    }


    const rut = this.datos.rut+this.datos.dv; 
    const esValido = this.validarRut(rut);

    if (!esValido) {
      this.toast.error(
        'Error, el rut ingresado no es válido.'
        );
      return;
    }


    

    console.log('datos ->', this.datos);
    const res = await this.auth.register(this.datos).catch( res =>  {
      console.log('error')
      this.toast.error(
        'Error, el email ingresado ya existe.'
      );
    })
    if (res && res.user) {
      const path = 'Usuarios';
      const id = res.user.uid;
      this.datos.uid = id;
      this.datos.password = '';
      await this.firestore.createDoc(this.datos, path, id)
      localStorage.setItem('correo', this.datos.correo);
      this.router.navigate(['/email-validation'])
      this.toast.success('Cuenta creada correctamente.');
      this.formRegister.reset();
    }

  }

  //Verifica que la persona registrada sea mayor de edad
  mayorDeEdad(fechaNacimientoForm:Date):boolean{
    let fechaNacimiento= new Date(fechaNacimientoForm);
    let fechaActual= new Date();
    
    const diferenciaMilisegundos = fechaActual.getTime() - fechaNacimiento.getTime();

    const milisegundosPorAnio = 1000 * 60 * 60 * 24 * 365.25; 
    const edad = Math.floor(diferenciaMilisegundos / milisegundosPorAnio);

    console.log(edad); 
    if (edad>=18){
      return true;
    }else{
      return false;
    }
    
  }

  //Valida a través del digito verificador que el rut sea válido
  validarRut(rut: string): boolean {
    rut = rut.replace(/\./g, '').toUpperCase(); 
    const rutSinDigitoVerificador = rut.slice(0, -1);
    const digitoVerificador = rut.slice(-1);
    const cuerpoRut = parseInt(rutSinDigitoVerificador, 10);
   
    let suma = 0;
    let multiplicador = 2;
    let resto;
    let digitoVerificadorEsperado;
  
    for (let i = rutSinDigitoVerificador.length - 1; i >= 0; i--) {
      suma += multiplicador * parseInt(rutSinDigitoVerificador.charAt(i), 10);
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
  
    resto = suma % 11;
    digitoVerificadorEsperado = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
  
    return digitoVerificador === digitoVerificadorEsperado;
  }
}
