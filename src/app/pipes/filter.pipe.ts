import { Pipe, PipeTransform } from '@angular/core';
import { Publicacion } from 'src/app/models/publicacion';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(publicaciones: Publicacion[], termino: string): Publicacion[] {
    if (!publicaciones || !termino) {
      return publicaciones;
    }
    return publicaciones.filter(publicacion =>
      publicacion.titulo.toLowerCase().includes(termino.toLowerCase()) ||
      publicacion.descripcion.toLowerCase().includes(termino.toLowerCase())
    );
  }

}
