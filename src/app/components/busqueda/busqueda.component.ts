import { Component, OnInit } from '@angular/core';
import { PublicacionesService } from 'src/app/services/publicaciones.service'; 
import { Publicacion } from 'src/app/models/publicacion'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent implements OnInit {
  publicaciones!: Publicacion[];

  constructor(private publicacionesService: PublicacionesService, private router: Router) {}

  ngOnInit() {
    this.publicacionesService.getPublicaciones().subscribe(publicaciones => {
      this.publicaciones = publicaciones;
    });
  }

  abrirPublicacion(id?: string) {
    if (id) {
      this.router.navigate(['/publicacion', id]);
    }
  }
}

