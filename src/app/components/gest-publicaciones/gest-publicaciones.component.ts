import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, switchMap, filter } from 'rxjs/operators';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { User } from 'src/app/models/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gest-publicaciones',
  templateUrl: './gest-publicaciones.component.html',
  styleUrls: ['./gest-publicaciones.component.css']
})
export class GestPublicacionesComponent implements OnInit {
  publicaciones!: Observable<any>;
  publicacionesFiltradas!: any[];
  rutUsuario: string = '';
  noHayPublicaciones: boolean = false; // Variable para verificar si no hay publicaciones

  constructor(
    private publicacionService: PublicacionesService,
    private firestore: AngularFirestore,
    private router: Router
  ) { }

  ngOnInit() {
    this.publicaciones = this.publicacionService.getPublicaciones().pipe(
      switchMap(publicaciones => {
        const observables = publicaciones.map((publicacion: any) => {
          return this.firestore.doc<User>(`Usuarios/${publicacion.uid}`).valueChanges().pipe(
            map(user => {
              const rut = user?.rut || '';
              const dv = user?.dv || '';
              return { ...publicacion, rut, dv };
            })
          );
        });
        return combineLatest(observables);
      })
    );

    this.publicaciones.subscribe(data => {
      this.publicacionesFiltradas = data;
    });
  }

  filtrarPublicaciones() {
    if (this.rutUsuario) {
      const rutFiltrado = this.rutUsuario.replace(/\./g, '').toUpperCase();
      this.publicaciones.subscribe(data => {
        this.publicacionesFiltradas = data.filter((publicacion: any) => {
          const rutPublicacion = publicacion.rut.replace(/\./g, '').toUpperCase();
          const dvPublicacion = publicacion.dv.toUpperCase();
          const rutCompleto = rutPublicacion + '-' + dvPublicacion;
          return rutCompleto.includes(rutFiltrado);
        });
        this.noHayPublicaciones = this.publicacionesFiltradas.length === 0; // Verificar si no hay publicaciones
      });
    } else {
      this.publicaciones.subscribe(data => {
        this.publicacionesFiltradas = data;
        this.noHayPublicaciones = false; // Restablecer la variable cuando no hay rut filtrado
      });
    }
  }

  editarPublicacion(publicacionId: string) {
    this.router.navigate(['/gest-editar-publicacion', publicacionId]);
  }

  eliminarPublicacion(publicacionId: string) {
    this.publicacionService.deletePublicacion(publicacionId)
      .then(() => {
        console.log('Publicación eliminada correctamente');
        // Realizar acciones adicionales después de la eliminación
      })
      .catch((error: any) => {
        console.error('Error al eliminar la publicación:', error);
        // Manejar el error de eliminación
      });
  }
}