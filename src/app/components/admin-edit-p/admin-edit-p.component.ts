import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { PublicacionesService } from 'src/app/services/publicaciones.service';

@Component({
  selector: 'app-admin-edit-p',
  templateUrl: './admin-edit-p.component.html',
  styleUrls: ['./admin-edit-p.component.css']
})
export class AdminEditPComponent implements OnInit {
  publicacionId: string | null = null;
  publicacion: any = {};

  constructor(
    private route: ActivatedRoute,
    private publicacionService: PublicacionesService
  ) {}

  ngOnInit() {
    this.publicacionId = this.route.snapshot.paramMap.get('id');
    if (this.publicacionId) {
      this.publicacionService.getPublicacion(this.publicacionId).subscribe(
        (publicacion: any) => {
          this.publicacion = publicacion;
        },
        (error: any) => {
          console.error('Error al obtener los datos de la publicación:', error);
        }
      );
    }
  }

  guardarCambios() {
    if (this.publicacionId !== null) {
      this.publicacionService.updatePublicacion(this.publicacionId, this.publicacion)
        .then(() => {
          console.log('Publicación actualizada correctamente');
          // Realizar acciones adicionales después de la actualización
        })
        .catch((error: any) => {
          console.error('Error al actualizar la publicación:', error);
          // Manejar el error de actualización
        });
    }
  }
  
}
