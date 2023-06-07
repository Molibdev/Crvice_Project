import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Storage, ref, uploadBytes } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-nueva-publicacion',
  templateUrl: './nueva-publicacion.component.html',
  styleUrls: ['./nueva-publicacion.component.css']
})
export class NuevaPublicacionComponent implements OnInit {
  formulario: FormGroup; // Formulario para la nueva publicación
  uid: string = ''; // ID del usuario actual
  fileInputRef: any[] = []; // Referencias a los elementos de entrada de archivo
  urlImage: string = ''; // URL de la imagen
  maxPhotosAllowed = 4; // Número máximo de fotos permitidas para la publicación
  formularioEnviado = false; // Bandera para controlar si el formulario ha sido enviado

  constructor(
    private publicacionesService: PublicacionesService,
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private storage: Storage,
    private authfirebase: AngularFireAuth,
    private route: Router,
    private toast: HotToastService,
  ) {
    // Inicializar el formulario con los campos y validadores necesarios
    this.formulario = new FormGroup({
      titulo: new FormControl('', Validators.required), // Campo título con validador de requerido
      rubro: new FormControl('', Validators.required), // Campo rubro con validador de requerido
      descripcion: new FormControl('', Validators.required), // Campo descripción con validador de requerido
      precio: new FormControl('', [
        Validators.required, // Campo precio con validador de requerido
        Validators.pattern(/^\d{1,3}(?:\.\d{3})*(?:,\d{2})?$/) // Validador de patrón para el formato de precio
      ]),
      photoPost: new FormControl(), // Control para subir fotos de la publicación
      uid: new FormControl(), // Control para almacenar el ID del usuario
      nombre: new FormControl(), // Control para almacenar el nombre del usuario
      apellido: new FormControl() // Control para almacenar el apellido del usuario
    });

    // Obtener el ID del usuario actual y establecerlo en el formulario
    this.authService.getUid().then((uid) => {
      if (uid) {
        this.uid = uid;
        this.formulario.controls['uid'].setValue(uid);
      }
    });

    this.fileInputRef = [];
  }

  async ngOnInit() {
    // Obtener el nombre del usuario actual desde el servicio Firebase
    this.firebaseService.getUserName().subscribe((name) => {
      // Separa el nombre y apellido
      const [nombre, apellido] = name.split(' ');

      // Verifica que los controles de formulario no sean nulos antes de llamar al método setValue
      const nombreControl = this.formulario.get('nombre');
      if (nombreControl) {
        nombreControl.setValue(nombre);
      }

      const apellidoControl = this.formulario.get('apellido');
      if (apellidoControl) {
        apellidoControl.setValue(apellido);
      }
    });

    try {
      const user = await this.authfirebase.currentUser;
      this.uid = user?.uid || ''; // Verificación de tipo
      console.log('uid ->', this.uid);
    } catch (error) {
      console.log('Error al obtener el UID:', error);
    }

    this.fileInputRef = Array.from(document.querySelectorAll('#fileInput'));
  }

  onSubmit($event: any) {
    this.formularioEnviado = true;

    // Marcar todos los campos como "touched"
    this.markAllFieldsAsTouched();

    // Verificar si el formulario es válido antes de continuar
    if (this.formulario.valid) {
      const precioValue = this.formulario.get('precio')?.value;

      // Verificar si el valor del precio es válido según las reglas
      if (!this.formulario.get('precio')?.valid) {
        console.log('El precio no cumple con las reglas especificadas.');
        return;
      }

      const numericPrecio = Number(precioValue.replace(/\./g, '').replace(/,/g, ''));

      console.log(this.formulario.value);

      // Agregar la nueva publicación a través del servicio de publicaciones
      this.publicacionesService.addPublicacion(this.formulario.value)
        .then((publicacionId) => {
          console.log('ID de la publicación:', publicacionId);

          // Subir las imágenes de la publicación
          this.uploadImages(publicacionId)
            .then(() => {
              this.toast.success('¡Publicación creada!');
              this.route.navigate(['/mis-publicaciones']);
            })
            .catch((error) => {
              console.log('Error al subir las imágenes:', error);
            });
        })
        .catch((error) => {
          console.log('Error al agregar la publicación:', error);
        });
    }
  }

  volver() {
    this.route.navigate(['/profile']);
  }

  private markAllFieldsAsTouched() {
    // Marcar todos los campos del formulario como "touched"
    Object.keys(this.formulario.controls).forEach((field) => {
      const control = this.formulario.get(field);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private uploadImages(publicacionId: string): Promise<void> {
    // Método para subir las imágenes de la publicación
    return new Promise<void>(async (resolve, reject) => {
      for (let i = 0; i < this.fileInputRef.length; i++) {
        const files = this.fileInputRef[i].files;
        for (let j = 0; j < files.length; j++) {
          const file = files[j];
          console.log(file);
          console.log(this.uid);
          const user = await this.authfirebase.currentUser;
          const imgRef = ref(
            this.storage,
            `images/posts/${user?.uid}/${publicacionId}/${file.name}`
          );
          try {
            await uploadBytes(imgRef, file);
          } catch (error) {
            reject(error);
            return;
          }
        }
      }
      resolve();
    });
  }
}
