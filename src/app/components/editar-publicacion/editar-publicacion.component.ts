import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { Publicacion } from 'src/app/models/publicacion'; 
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-publicacion',
  templateUrl: './editar-publicacion.component.html',
  styleUrls: ['./editar-publicacion.component.css']
})
export class EditarPublicacionComponent implements OnInit{
  publicacion?: Publicacion;

  constructor(
    private route: ActivatedRoute,
    private publicacionesService: PublicacionesService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.publicacionesService.getPublicacion(id).subscribe(publicacion => {
        this.publicacion = publicacion;
      });
    }
  }
  onSubmit(form: NgForm) {
    console.log('Form submitted');
    console.log('Form valid:', form.valid);
    console.log('Publication:', this.publicacion);
    if (form.valid && this.publicacion && this.publicacion.id) {
      console.log('Calling updatePublicacion method');
      this.publicacionesService.updatePublicacion(this.publicacion.id, this.publicacion);
    } else {
      console.log('Form valid:', form.valid);
      console.log('this.publicacion:', this.publicacion);
      if (this.publicacion) {
        console.log('this.publicacion.id:', this.publicacion.id);
      }
    }
  }

}