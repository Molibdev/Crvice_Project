import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';


@Component({
  selector: 'app-nueva-publicacion',
  templateUrl: './nueva-publicacion.component.html',
  styleUrls: ['./nueva-publicacion.component.css']
})
export class NuevaPublicacionComponent implements OnInit {
  formulario: FormGroup;
  uid: string = '';
  
  constructor(
    private publicacionesService: PublicacionesService,
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) {
      this.formulario = new FormGroup({
        titulo: new FormControl(),
        rubro: new FormControl(),
        descripcion: new FormControl(),
        precio: new FormControl(),
        imagen: new FormControl(),
        uid: new FormControl()
    });
      this.authService.getUid().then((uid) => {
        if (uid) {
          this.uid = uid;
          this.formulario.controls['uid'].setValue(uid);
         }
    });
  }

  ngOnInit(): void {
  }

  async onSubmit() {
    console.log(this.formulario.value)
    const response = await this.publicacionesService.addPublicacion(this.formulario.value);
    console.log(response);
  }

}


