import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {

  constructor( private router: Router ){

  }

  registro() {
      this.router.navigate(['/register'])
  }

  buscar(event: Event) {
    const target = event.target as HTMLInputElement;
    const termino = target.value;
    this.router.navigate(['/busqueda', termino]);
  }

}
