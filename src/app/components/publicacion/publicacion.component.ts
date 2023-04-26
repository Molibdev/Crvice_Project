import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacionesService } from 'src/app/services/publicaciones.service'; 
import { Publicacion } from 'src/app/models/publicacion'; 

@Component({
  selector: 'app-publicacion',
  templateUrl: './publicacion.component.html',
  styleUrls: ['./publicacion.component.css']
})
export class PublicacionComponent implements OnInit {
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
}