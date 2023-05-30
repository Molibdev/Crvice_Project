import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { HotToastService } from '@ngneat/hot-toast';
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
    private publicacionService: PublicacionesService,
    private router: Router,
    private toast: HotToastService,
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
      // Verificar el formato del precio
      const precioRegex = /^\d{1,3}(\.\d{3})*$/;
      if (!precioRegex.test(this.publicacion.precio)) {
        this.toast.error('El formato del precio debe ser en CLP (000.000.000)');
        return;
      }
  
      this.publicacionService.updatePublicacion(this.publicacionId, this.publicacion)
        .then(() => {
          console.log('Publicación actualizada correctamente');
          // Realizar acciones adicionales después de la actualización
          this.router.navigate(['/gestionar-publicaciones']);
          this.toast.success('Publicacion Editada con éxito');
        })
        .catch((error: any) => {
          console.error('Error al actualizar la publicación:', error);
          this.toast.error('Ha ocurrido un error al intentar eliminar la publicacion');
        });
    }
  }

  volver(){
    this.router.navigate(['/gestionar-publicaciones']);
  }
  
}
