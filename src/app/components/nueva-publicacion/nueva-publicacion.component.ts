import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Storage, ref, uploadBytes, listAll, getDownloadURL } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-nueva-publicacion',
  templateUrl: './nueva-publicacion.component.html',
  styleUrls: ['./nueva-publicacion.component.css']
})
export class NuevaPublicacionComponent implements OnInit {
  formulario: FormGroup;
  uid: string = '';
  fileInputRef: any[] = [];
  urlImage: string = '';
  maxPhotosAllowed = 4;

  constructor(
    private publicacionesService: PublicacionesService,
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private storage: Storage,
    private authfirebase: AngularFireAuth,
    private route: Router,
    private toast: HotToastService
  ) {
    this.formulario = new FormGroup({
      titulo: new FormControl(),
      rubro: new FormControl(),
      descripcion: new FormControl(),
      precio: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{3})?$/), // Expresión regular para permitir números enteros o decimales con 3 decimales exactos
      ]),
      photoPost: new FormControl(),
      uid: new FormControl(),
      nombre: new FormControl(),
      apellido: new FormControl()
    });
    this.authService.getUid().then((uid) => {
      if (uid) {
        this.uid = uid;
        this.formulario.controls['uid'].setValue(uid);
      }
    });
    this.fileInputRef = [];
  }

  async ngOnInit() {
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

  async onSubmit($event: any) {
    const precioValue = this.formulario.get('precio')?.value;

    // Verificar si el valor del precio es válido según las reglas
    if (!this.formulario.get('precio')?.valid) {
      console.log('El precio no cumple con las reglas especificadas.');
      this.toast.error('El precio debe estar en el formato correcto: 000.000');
      return;
    }

    const numericPrecio = Number(precioValue.replace(/\./g, '').replace(/,/g, ''));

    console.log(this.formulario.value);
    const publicacionId = await this.publicacionesService.addPublicacion(this.formulario.value);

    console.log('ID de la publicación:', publicacionId);

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
        this.toast.success('¡Publicación creada!');
        try {
          const response = await uploadBytes(imgRef, file);
          console.log(response);
        } catch (error) {
          console.log(error);
        }
      }
    }
    this.route.navigate(['/mis-publicaciones']);
  }
}
