import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { Publicacion } from '../models/publicacion';
@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {

  constructor(private firestore: Firestore) { }

  addPublicacion(publicacion: Publicacion) {
    const placeRef = collection(this.firestore, 'Publicaciones');
    return addDoc(placeRef, publicacion);
  }

}
