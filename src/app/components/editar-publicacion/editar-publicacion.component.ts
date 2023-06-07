import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { Publicacion } from 'src/app/models/publicacion';
import { NgForm } from '@angular/forms';
import { Storage, ref, listAll, deleteObject } from '@angular/fire/storage';
import { uploadBytes } from 'firebase/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HotToastService } from '@ngneat/hot-toast';
import { Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-editar-publicacion',
  templateUrl: './editar-publicacion.component.html',
  styleUrls: ['./editar-publicacion.component.css']
})
export class EditarPublicacionComponent implements OnInit {
  publicacion?: Publicacion; // Objeto de publicación
  newImages: File[] = []; // Nuevas imágenes seleccionadas
  public isLoading: boolean = false; // Indicador de carga
  public fotos: string[] = []; // Array de URLs de fotos
  fotoActual: string | undefined; // URL de la foto actualmente mostrada
  indiceFotoActual: number = 0; // Índice de la foto actual
  public imagenPredeterminada = '../../../assets/img/foto6.jpg'; // URL de la imagen predeterminada
  formSubmitted = false; // Propiedad para realizar un seguimiento del intento de envío del formulario

  constructor(
    private route: ActivatedRoute,
    private publicacionesService: PublicacionesService,
    private storage: Storage,
    private authfirebase: AngularFireAuth,
    private toast: HotToastService,
    private router: Router,
    private firebase: FirebaseService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.publicacionesService.getPublicacion(id).subscribe(publicacion => {
        this.publicacion = publicacion;
        localStorage.setItem('publicacionId', id);

        // Obtener las URL de las fotos
        this.firebase.getFotosURL(publicacion.uid, id).subscribe(urls => {
          Promise.all(urls).then(resolvedUrls => {
            this.fotos = resolvedUrls;

            if (this.fotos.length > 0) {
              this.fotoActual = this.fotos[0];
            } else {
              this.fotoActual = this.imagenPredeterminada;
            }
          });
        });
      });
    }
  }

  
  // Método para manejar la selección de nuevas imágenes.
  
  onNewFilesSelected(event: any) {
    this.newImages = event.target.files;
  }

  
  // Método para enviar el formulario de edición de publicación.
  
  async onSubmit(form: NgForm) {
    this.formSubmitted = true; // Marcar que se ha intentado enviar el formulario
    console.log('Form submitted');
    console.log('Form valid:', form.valid);
    console.log('Publication:', this.publicacion);
    if (form.valid && this.publicacion && this.publicacion.id) {
      console.log('Calling updatePublicacion method');

      // Verificar si el valor del precio es válido según las reglas
      if (!form.controls['precio'].valid) {
        console.log('El precio no cumple con las reglas especificadas.');
        this.toast.error('El precio debe estar en el formato correcto: 000.000');
        return;
      }

      this.publicacionesService.updatePublicacion(this.publicacion.id, this.publicacion);
      this.toast.success('La publicación ha sido editada');
      this.router.navigate(['/mis-publicaciones']);
      if (this.newImages.length > 0) {
        await this.replaceImages(this.publicacion.id, this.newImages);
      }
    } else {
      console.log('Form valid:', form.valid);
      console.log('this.publicacion:', this.publicacion);
      if (this.publicacion) {
        console.log('this.publicacion.id:', this.publicacion.id);
      }
    }
  }

  
  // Método para reemplazar las imágenes de una publicación.
  
  async replaceImages(publicacionId: string, newImages: File[]) {
    const user = await this.authfirebase.currentUser;
    const storageRef = ref(this.storage, `images/posts/${user?.uid}/${publicacionId}`);
    const existingImages = await listAll(storageRef);

    // Eliminar las imágenes existentes
    await Promise.all(existingImages.items.map(item => deleteObject(item)));

    // Subir las nuevas imágenes
    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i];
      const imgRef = ref(storageRef, file.name);

      try {
        await uploadBytes(imgRef, file);
        console.log('Imagen subida:', file.name);
      } catch (error) {
        console.error('Error al subir imagen:', error);
      }
    }

    console.log('Reemplazo de imágenes completado.');
  }

  
   //Método para volver a la lista de publicaciones del usuario.
  
  volver() {
    this.router.navigate(['/mis-publicaciones']);
  }

  
   //Método para mostrar la imagen anterior en el carrusel.
  
  mostrarImagenAnterior() {
    this.indiceFotoActual--;
    if (this.indiceFotoActual < 0) {
      this.indiceFotoActual = this.fotos.length - 1;
    }
    this.fotoActual = this.fotos[this.indiceFotoActual];
  }

 
  // Método para mostrar la siguiente imagen en el carrusel.
 
  mostrarImagenSiguiente() {
    this.indiceFotoActual++;
    if (this.indiceFotoActual >= this.fotos.length) {
      this.indiceFotoActual = 0;
    }
    this.fotoActual = this.fotos[this.indiceFotoActual];
  }
}
