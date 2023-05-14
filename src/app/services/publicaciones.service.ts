import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, docData, query, where, updateDoc } from '@angular/fire/firestore';
import { Publicacion } from '../models/publicacion';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {

  constructor( private firestore: Firestore,
              ) { }

  addPublicacion(publicacion: Publicacion) {
    const publicacionRef = collection(this.firestore, 'Publicaciones');
    return addDoc(publicacionRef, publicacion).then(docRef => docRef.id);
  }

  getPublicaciones(): Observable<Publicacion[]> {
    const placeRef = collection(this.firestore, 'Publicaciones');
    return collectionData(placeRef, { idField: 'id' }) as Observable<Publicacion[]>;
  }

  // getPublicacion(id: string): Observable<Publicacion> {
  //   const publicacionRef = doc(this.firestore, 'Publicaciones', id);
  //   return docData(publicacionRef) as Observable<Publicacion>;
  // } Metodo que ocupe antes, lo deje de momento por si pasa algun error


  getPublicacion(id: string): Observable<Publicacion> {
    const publicacionRef = doc(this.firestore, 'Publicaciones', id);
    return docData(publicacionRef).pipe(
      map(publicacion => ({ ...publicacion, id }))
    ) as Observable<Publicacion>;
  }
  getPublicacionesByUser(userId: string): Observable<Publicacion[]> {
    console.log(`Getting publications for user ${userId}`);
    const placeRef = collection(this.firestore, 'Publicaciones');
    const q = query(placeRef, where('uid', '==', userId));
    const publicaciones$ = collectionData(q, { idField: 'id' }) as Observable<Publicacion[]>;
    publicaciones$.subscribe(publicaciones => {
      console.log(publicaciones);
    });
    return publicaciones$;
  }

  async updatePublicacion(id: string, data: Partial<Publicacion>) {
    console.log(`Actualizando publicacion ${id} with data:`, data);
    const publicacionRef = doc(this.firestore, 'Publicaciones', id);
    try {
      await updateDoc(publicacionRef, data);
      console.log('Documento actualizado');
    } catch (error) {
      console.error('Error al editar:', error);
    }
  }

  public uidUsuario: string = '';
  public uidUsuarioMapa: string = '';
  public usuarioComuna: string = '';
  public usuarioDireccion: string = '';
}
