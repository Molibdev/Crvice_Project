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
      (publicacion.titulo && this.buscarPalabra(publicacion.titulo, termino)) ||
      (publicacion.descripcion && this.buscarPalabra(publicacion.descripcion, termino))
    );
  }

  buscarPalabra(texto: string, palabra: string): boolean {
    const palabraSingular = this.convertirASingular(palabra);
    return texto.toLowerCase().includes(palabra.toLowerCase()) ||
           texto.toLowerCase().includes(palabraSingular.toLowerCase());
  }

  convertirASingular(palabra: string): string {
    if (palabra.endsWith('s')) {
      return palabra.slice(0, -1);
    }
    return palabra;
  }

}