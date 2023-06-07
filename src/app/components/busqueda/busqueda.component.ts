import { Component, OnInit } from '@angular/core';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { Publicacion } from 'src/app/models/publicacion';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent implements OnInit {
  publicaciones!: Publicacion[]; // Lista de publicaciones obtenidas de la búsqueda
  termino!: string; // Término de búsqueda ingresado por el usuario
  public isLoading: boolean = false; // Indicador de carga
  public fotosURLs: { [publicacionId: string]: Promise<string> } = {}; // URLs de las fotos de las publicaciones
  public imagenPredeterminada = '../../../assets/img/foto6.jpg'; // Ruta de la imagen predeterminada

  constructor(
    private publicacionesService: PublicacionesService,
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    this.isLoading = true;

    // Obtener el parámetro 'termino' de la URL
    this.route.params.subscribe(params => {
      this.termino = params['termino'];
    });

    // Obtener las publicaciones según el término de búsqueda
    this.publicacionesService.getPublicaciones().subscribe(publicaciones => {
      this.publicaciones = publicaciones;
      this.isLoading = false;

      // Obtener las URLs de las imágenes
      this.getFotosURLs(publicaciones);
    });
  }

  abrirPublicacion(id?: string) {
    if (id) {
      this.router.navigate(['/publicacion', id]);
    }
  }

  buscar(event: Event) {
    const target = event.target as HTMLInputElement;
    const termino = target.value;

    // Navegar a la página de búsqueda con el nuevo término
    this.router.navigate(['/busqueda', termino]);
  }

  getFotosURLs(publicaciones: Publicacion[]) {
    // Iterar sobre las publicaciones y obtener las URLs de las imágenes
    publicaciones.forEach(publicacion => {
      const userId = publicacion.uid;
      const publicacionId = publicacion.id;

      if (publicacionId) {
        // Obtener las URLs de las fotos de la publicación
        this.firebaseService.getFotosURL(userId, publicacionId).subscribe(urls => {
          // Guardar la URL de la foto en la propiedad fotosURLs
          this.fotosURLs[publicacionId] = urls[0];
        }, error => {
          // Si ocurre un error al obtener la URL de la foto, usar la imagen predeterminada
          this.fotosURLs[publicacionId] = Promise.resolve(this.imagenPredeterminada);
        });
      }
    });
  }
}
