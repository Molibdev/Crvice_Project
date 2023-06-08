import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Trabajo } from 'src/app/models/models';
import { Publicacion } from 'src/app/models/publicacion';

@Component({
  selector: 'app-trabajos',
  templateUrl: './trabajos.component.html',
  styleUrls: ['./trabajos.component.css']
})
export class TrabajosComponent implements OnInit {
  public trabajos: Trabajo[] = []; // Array para almacenar los trabajos
  public isLoading: boolean= false; // Variable para indicar si se está cargando
  public sinContrataciones: boolean = false; // Indicador de falta de trabajos
  mostrarTrabajos: boolean = true; // Propiedad mostrarTrabajos

  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private auth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.isLoading = true; // Establecer isLoading a true para indicar que se está cargando
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.cargarTrabajos(user.uid); // Cargar los trabajos del usuario actual
      }
    });
  }
  
  private cargarTrabajos(usuarioId: string): void {
    this.firestore
      .collection<Trabajo>('Trabajos', (ref) =>
        ref.where('idUsuarioPublicacion', '==', usuarioId)
      )
      .get()
      .toPromise()
      .then((trabajosSnapshot) => {
        if (trabajosSnapshot) {
          const trabajosPromises = trabajosSnapshot.docs.map((trabajoDoc) => {
            const trabajo: Trabajo = {
              id: trabajoDoc.id, // Asignar el ID del trabajo
              ...trabajoDoc.data()
            } as Trabajo;
            trabajo.trabajoId = trabajoDoc.id; // Asignar el valor del ID generado automáticamente a la propiedad trabajoId
            return this.firestore
              .collection<Publicacion>('Publicaciones')
              .doc(trabajo.idPublicacion)
              .get()
              .toPromise()
              .then((publicacionDoc) => {
                if (publicacionDoc && publicacionDoc.exists) {
                  trabajo.publicacion = {
                    id: publicacionDoc.id,
                    ...publicacionDoc.data()
                  } as Publicacion;
                }
                return trabajo;
              });
          });
          Promise.all(trabajosPromises).then((trabajos) => {
            this.trabajos = trabajos; // Asignar los trabajos al array
            this.isLoading = false; // Establecer isLoading a false para indicar que se ha terminado de cargar
          });
        }
      });
  }
  
  responderSolicitud(trabajo: Trabajo) {
    if (trabajo.publicacion && trabajo.publicacion.id) {
      const queryParams = {
        trabajoId: trabajo.id,
        publicacionId: trabajo.publicacion.id
      };
      this.router.navigate(['/resp-solicitud'], { queryParams }); // Navegar a la página de respuesta de solicitud con los parámetros de consulta
    } else {
      console.error('El trabajo no tiene una publicación definida');
    }
  }
  
  get trabajosPendientes(): any[] {
    return this.trabajos.filter(trabajo => trabajo.estado === 'Pendiente');
  }
  
  get trabajosAceptados(): any[] {
    return this.trabajos.filter(trabajo => trabajo.estado === 'Aceptado');
  }

  get trabajosCancelados(): any[] {
    return this.trabajos.filter(trabajo => trabajo.estado === 'Cancelado');
  }

  get trabajosRespondidos(): any[] {
    return this.trabajos.filter(trabajo => trabajo.estado === 'Respondido');
  }

  get trabajosCompletados(): any[] {
    return this.trabajos.filter(trabajo => trabajo.estado === 'Completado');
  }

  get trabajosAbonados(): any[] {
    return this.trabajos.filter(trabajo => trabajo.estado === 'Abonado');
  }

  get trabajosCalificadoPorCliente(): any[] {
    return this.trabajos.filter(trabajo => trabajo.estado === 'Calificado Por Cliente');
  }

  get trabajosTerminados(): any[] {
    return this.trabajos.filter(trabajo => trabajo.estado === 'Terminado');
  }
  
}
