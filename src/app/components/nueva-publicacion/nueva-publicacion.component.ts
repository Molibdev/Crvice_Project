import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Storage, ref, uploadBytes, listAll, getDownloadURL} from '@angular/fire/storage'
import { Trabajo } from 'src/app/models/models';
import { UsersService } from 'src/app/services/users.service';


@Component({
  selector: 'app-nueva-publicacion',
  templateUrl: './nueva-publicacion.component.html',
  styleUrls: ['./nueva-publicacion.component.css']
})
export class NuevaPublicacionComponent implements OnInit {
  formulario: FormGroup;
  uid: string = '';
  fileInputRef: any[] = [];
  urlImage: string ='';
  maxPhotosAllowed = 4;
  
  
  constructor(
    private publicacionesService: PublicacionesService,
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private storage: Storage,
    private usersService: UsersService
  ) {
      this.formulario = new FormGroup({
        titulo: new FormControl(),
        rubro: new FormControl(),
        descripcion: new FormControl(),
        precio: new FormControl(),
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
      const uid = await this.authService.getUid();
      this.uid = uid as string; // Verificación de tipo
      console.log('uid ->', this.uid);
    } catch (error) {
      console.log('Error al obtener el UID:', error);
    }

    this.fileInputRef = Array.from(document.querySelectorAll('#fileInput'));
  }

  async onSubmit($event:any) {
    console.log(this.formulario.value)
    const publicacionId = await this.publicacionesService.addPublicacion(this.formulario.value);
    console.log('ID de la publicación:', publicacionId);

    const filesCount = this.fileInputRef.reduce(
      (count, input) => count + input.files.length,
      0
    );
  
    if (filesCount > this.maxPhotosAllowed) {
      console.log('Se excede la cantidad máxima de fotos permitidas.');
      return;
    }
  
    for (let i = 0; i < this.fileInputRef.length; i++) {
      const files = this.fileInputRef[i].files;
      for (let j = 0; j < files.length; j++) {
        const file = files[j];
        console.log(file);
        console.log(this.uid);
  
        const imgRef = ref(
          this.storage,
          `images/posts/${this.uid}/${publicacionId}/${file.name}`
        );
  
        try {
          const response = await uploadBytes(imgRef, file);
          console.log(response);
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

}


