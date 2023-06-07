import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {

  constructor(private router: Router) {
    // Constructor del componente
  }

  // Método para navegar a la página de registro
  registro() {
    this.router.navigate(['/register']);
  }

  // Método para realizar una búsqueda y navegar a la página de resultados
  buscar(event: Event) {
    const target = event.target as HTMLInputElement; // Obtener el elemento HTML del evento
    const termino = target.value; // Obtener el valor del elemento
    this.router.navigate(['/busqueda', termino]); // Navegar a la página de búsqueda con el término como parámetro
  }

}
