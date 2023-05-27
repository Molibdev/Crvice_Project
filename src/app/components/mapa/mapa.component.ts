import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseService } from 'src/app/services/firebase.service';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { Trabajo, User } from 'src/app/models/models';
import { ActivatedRoute, Route } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DomSanitizer } from '@angular/platform-browser';
import { Map, marker, tileLayer } from 'leaflet';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {

  public trabajo: Trabajo | undefined;
  public nombreUsuarioSolicitante = '';
  direccion: string = '';
  telefono: number = 0;
  comuna: string = ''
  latitud: number = 0;
  longitud: number = 0;
  usuarioId: string = '';
  usuarioMapa: User | null = null;


  coordenadas: { latitud: number, longitud: number } = {
    latitud: 0,
    longitud: 0
  };

  constructor( private http: HttpClient,
               private publicaciones: PublicacionesService,
               private route: ActivatedRoute,
               private firestore: AngularFirestore) {
               }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const trabajoId = params['trabajadorId'];
      console.log(trabajoId);
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).get().toPromise().then((trabajoDoc) => {
        if (trabajoDoc && trabajoDoc.exists) {
          this.trabajo = trabajoDoc.data() as Trabajo;
          this.firestore.collection<User>('Usuarios').doc(this.trabajo.idUsuarioSolicitante).get().toPromise().then((usuarioDoc) => {
            if (usuarioDoc && usuarioDoc.exists) {
              const usuario = usuarioDoc.data() as User;
              this.nombreUsuarioSolicitante = usuario.nombre + ' ' + usuario.apellido;
              this.publicaciones.uidUsuario = usuario.uid;
              this.publicaciones.uidUsuarioMapa = usuario.uid;
              this.comuna = usuario.comuna;
              this.direccion = usuario.direccion + ' ' + usuario.numDireccion;
              this.telefono = usuario.telefono
              console.log(this.comuna);
              console.log(this.direccion);
              this.obtenerCoordenadas();
            }
          });
        }
      });
    }); 
    }

  obtenerCoordenadas() {
    const url = `https://nominatim.openstreetmap.org/search?q=${this.direccion},${this.comuna},${'santiago'}&format=json`;
    this.http.get<any[]>(url).subscribe(data => {
      if (data && data.length > 0) {
        this.latitud = parseFloat(data[0].lat);
        this.longitud = parseFloat(data[0].lon);
        this.coordenadas.latitud = this.latitud;
        this.coordenadas.longitud = this.longitud;
        console.log(this.latitud);
        console.log(this.longitud);
        this.initializeMap();
      } else {
        console.log('No se pudo obtener las coordenadas.');
      }
    });
  }
  
  ngAfterViewInit() {
    // No se necesita inicializar el mapa aquí, se moverá a initializeMap()
  }
  
  initializeMap() {
    const map = new Map('map').setView([this.coordenadas.latitud, this.coordenadas.longitud], 13);
    console.log(this.coordenadas.latitud);
    console.log(this.coordenadas.longitud);
    tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    marker([this.coordenadas.latitud, this.coordenadas.longitud]).addTo(map);
  }
  





}






