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
  selector: 'app-admin-edit-p',
  templateUrl: './admin-edit-p.component.html',
  styleUrls: ['./admin-edit-p.component.css']
})

export class AdminEditPComponent implements OnInit {
  publicacion?: Publicacion;
  newImages: File[] = [];
  public isLoading: boolean = false;
  public fotos: string[] = [];
  fotoActual: string | undefined; // URL de la foto actualmente mostrada
  indiceFotoActual: number = 0; // Índice de la foto actual
  public imagenPredeterminada = '../../../assets/img/foto6.jpg';
  formSubmitted = false; // Propiedad para realizar un seguimiento del intento de envío del formulario

  constructor(
    private route: ActivatedRoute,
    private publicacionesService: PublicacionesService,
    private storage: Storage,
    private authfirebase: AngularFireAuth,
    private toast: HotToastService,
    private router: Router,
    private firebase: FirebaseService) { }

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
  
  onNewFilesSelected(event: any) {
    this.newImages = event.target.files;
  }

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
      this.router.navigate(['/gestionar-publicaciones']);
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

  async replaceImages(publicacionId: string, newImages: File[]) {
    const publicacion = this.publicacion; // Obtener la instancia de la publicación actual
  
    if (!publicacion) {
      console.error('No se pudo obtener la información de la publicación.');
      return;
    }
  
    const userId = publicacion.uid; // Obtener el ID del usuario que creó la publicación
    const storageRef = ref(this.storage, `images/posts/${userId}/${publicacionId}`);
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
  
  mostrarImagenAnterior() {
    this.indiceFotoActual--;
    if (this.indiceFotoActual < 0) {
      this.indiceFotoActual = this.fotos.length - 1;
    }
    this.fotoActual = this.fotos[this.indiceFotoActual];
  }

  mostrarImagenSiguiente() {
    this.indiceFotoActual++;
    if (this.indiceFotoActual >= this.fotos.length) {
      this.indiceFotoActual = 0;
    }
    this.fotoActual = this.fotos[this.indiceFotoActual];
  }

  volver(){
    this.router.navigate(['/gestionar-publicaciones']);
  }
  
}
