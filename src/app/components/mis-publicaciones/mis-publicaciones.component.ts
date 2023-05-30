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
  publicaciones$: Observable<Publicacion[]> | undefined;
  public isLoading = false;
  mostrarPrompt = false;
  publicacionSeleccionada: Publicacion | undefined;

  constructor(
    private publicacionesService: PublicacionesService,
    private auth: AngularFireAuth,
    private router: Router,
    private toast: HotToastService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.auth.authState.subscribe(user => {
      if (user) {
        this.publicaciones$ = this.publicacionesService.getPublicacionesByUser(user.uid);
        this.publicaciones$.subscribe(publicaciones => {
          console.log(publicaciones);
          this.isLoading = false;
        });
      }
    });
  }

  abrirPublicacion(id?: string) {
    if (id) {
      this.router.navigate(['/editar-publicacion', id]);
    }
  }
  

  mostrarDialogo(publicacion: Publicacion) {
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
    this.mostrarPrompt = false;
    this.publicacionSeleccionada = undefined;
  }
}
