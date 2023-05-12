import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseService } from 'src/app/services/firebase.service';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { Trabajo, User } from 'src/app/models/models';
import { ActivatedRoute, Route } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DomSanitizer } from '@angular/platform-browser';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements  OnInit {

  direccion: string = '';
  comuna: string = ''
  latitud: number = 0;
  longitud: number = 0;
  usuarioId: string = '';
  usuarioMapa: User | null = null;
  public trabajo: Trabajo | undefined;
  public nombreUsuarioSolicitante = '';

  constructor( private http: HttpClient,
               private publicaciones: PublicacionesService,) {

               }

  ngOnInit() {
    this.initMap();
  }

  private initMap() {
    const map = L.map('map').setView([this.latitud, this.longitud], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; OpenStreetMap contributors'
    }).addTo(map);
  }

  obtenerCoordenadas() {
    const url = `https://nominatim.openstreetmap.org/search?q=${this.publicaciones.usuarioDireccion},${this.publicaciones.usuarioComuna}&format=json`;
    this.http.get<any[]>(url).subscribe(data => {
      if (data && data.length > 0) {
        this.latitud = parseFloat(data[0].lat);
        this.longitud = parseFloat(data[0].lon);
      } else {
        console.log('No se pudo obtener las coordenadas.');
      }
    });
    
  }  






}






