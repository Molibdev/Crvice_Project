import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { Publicacion } from 'src/app/models/publicacion';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-mis-publicaciones',
  templateUrl: './mis-publicaciones.component.html',
  styleUrls: ['./mis-publicaciones.component.css']
})
export class MisPublicacionesComponent implements OnInit {
  publicaciones$: Observable<Publicacion[]> | undefined; // Observable de array de Publicacion
  public isLoading = false; // Indicador de carga
  mostrarPrompt = false; // Bandera para mostrar un cuadro de diálogo
  publicacionSeleccionada: Publicacion | undefined; // Publicacion seleccionada

  constructor(
    private publicacionesService: PublicacionesService,
    private auth: AngularFireAuth,
    private router: Router,
    private toast: HotToastService
  ) {}

  ngOnInit() {
    this.isLoading = true;

    // Suscripción al estado de autenticación de AngularFireAuth
    this.auth.authState.subscribe(user => {
      if (user) {
        // Obtener las publicaciones asociadas al usuario actual
        this.publicaciones$ = this.publicacionesService.getPublicacionesByUser(user.uid);
        this.publicaciones$.subscribe(publicaciones => {
          console.log(publicaciones);
          this.isLoading = false;
        });
      }
    });
  }

  abrirPublicacion(id?: string) {
    // Navegar a la página de edición de una publicación
    if (id) {
      this.router.navigate(['/editar-publicacion', id]);
    }
  }

  mostrarDialogo(publicacion: Publicacion) {
    // Mostrar el cuadro de diálogo para confirmar la eliminación de una publicación
    this.publicacionSeleccionada = publicacion;
    this.mostrarPrompt = true;
  }

  eliminarPublicacion() {
    if (this.publicacionSeleccionada && this.publicacionSeleccionada.id) {
      const publicacionId = this.publicacionSeleccionada.id;
      this.publicacionesService.deletePublicacion(publicacionId)
        .then(() => {
          console.log('Publicación eliminada correctamente');
          this.cerrarDialogo();
          this.toast.success('Publicación eliminada correctamente');
        })
        .catch((error: any) => {
          console.error('Error al eliminar la publicación:', error);
          // Manejar el error de eliminación
          this.cerrarDialogo();
        });
    }
  }

  cerrarDialogo() {
    // Cerrar el cuadro de diálogo
    this.mostrarPrompt = false;
    this.publicacionSeleccionada = undefined;
  }
}
