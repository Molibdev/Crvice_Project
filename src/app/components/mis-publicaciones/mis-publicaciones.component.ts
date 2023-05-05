import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'; 
import { Observable } from 'rxjs';
import { Publicacion } from 'src/app/models/publicacion'; 
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mis-publicaciones',
  templateUrl: './mis-publicaciones.component.html',
  styleUrls: ['./mis-publicaciones.component.css']
})
export class MisPublicacionesComponent implements OnInit {
  publicaciones$!: Observable<Publicacion[]>;

  constructor(
    private publicacionesService: PublicacionesService,
    private auth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit() {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.publicaciones$ = this.publicacionesService.getPublicacionesByUser(user.uid);
        this.publicaciones$.subscribe(publicaciones => {
          console.log(publicaciones);
        });
      }
    });
  }

  abrirPublicacion(id?: string) {
    if (id) {
      this.router.navigate(['/editar-publicacion', id]);
    }
  }
}