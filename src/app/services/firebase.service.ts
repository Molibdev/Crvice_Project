import { Injectable } from '@angular/core';
import { Action, AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, DocumentSnapshot  } from '@angular/fire/compat/firestore';
import { collectionData, query, Firestore,  } from '@angular/fire/firestore';
import {doc,docData,} from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import {  map, Observable, of, switchMap } from 'rxjs';
import { Trabajo, User, userDataBank } from '../models/models';
import { AuthService } from 'src/app/services/auth.service';
import 'firebase/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  

  constructor(private firestore:AngularFirestore,
              private fstore: Firestore,
              private authService: AuthService,
              private auth: AngularFireAuth,
              private storage: AngularFireStorage) { }

  createDoc(data: any, path: string, id:string) {
    const collection = this.firestore.collection(path);
    return collection.doc(id).set(data);
  }

  getId() {
    return this.firestore.createId();
  }

  getCollection<tipo>(path: string) {

    const collection = this.firestore.collection<tipo>(path);
    return collection.valueChanges();

  }

  getDoc<tipo>(path: string, id: string){
    return this.firestore.collection(path).doc<tipo>(id).valueChanges();
  }

  updateDoc(path: string, id: string, data: any){
    return this.firestore.collection(path).doc(id).update(data)
  }

  get allUsers$(): Observable<User[]> {
    const ref = collection(this.fstore, 'Usuarios');
    const queryAll = query(ref);
    return collectionData(queryAll) as Observable<User[]>;
  }

  get currentUserProfile$(): Observable<User | null> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user?.uid) {
          return of(null);
        }

        const ref = doc(this.fstore, 'Usuarios', user?.uid);
        return docData(ref) as Observable<User>;
      })
    );
  }
  
  getUserName(): Observable<string> {
    return this.currentUserProfile$.pipe(
      map((user) => `${user?.nombre} ${user?.apellido}`)
    );
  }

  getUserProfiles(uid: string): Observable<User> {
    const userRef = this.firestore.collection('Usuarios').doc<User>(uid);
    return userRef.snapshotChanges().pipe(
      map((action: Action<DocumentSnapshot<User>>) => {
        const snapshot = action.payload;
        const data = snapshot.data();
        const id = snapshot.id;
        return { id, ...data } as User;
      })
    );
  }

  getUserProfile(uid: string): Observable<User> {
    return this.getDoc<User>('Usuarios', uid).pipe(
      map((user) => {
        if (!user) {
          throw new Error(`User with uid ${uid} not found`);
        }
        return user;
      })
    );
  }
  
  

  updateUserCalificaciones(uid: string, calificacion: number, comentario: string) {
    const calificacionesRef = this.firestore.collection('Usuarios').doc(uid).collection('calificaciones').doc();
    return calificacionesRef.set({ calificacion, comentario });
  }

  updateUserPromedioCalificaciones(uid: string, promedioCalificaciones: number) {
    const usuarioRef = this.firestore.collection('Usuarios').doc(uid);
    usuarioRef.update({ promedioCalificaciones });
  }

  getCurrentUserUid(): Observable<string | null> {
    return this.auth.authState.pipe(map(user => user ? user.uid : null));
  }

  getFotosURL(userId: string, publicacionId: string) {
    const path = `images/posts/${userId}/${publicacionId}`;
    return this.storage.ref(path).listAll().pipe(
      map(res => {
        return res.items.map(item => item.getDownloadURL());
      })
    );
  }

  getTrabajo(trabajoId: string): Observable<Trabajo> {
    return this.firestore.collection('Trabajos').doc(trabajoId).valueChanges() as Observable<Trabajo>;
  }

  guardarDatosTransferencia(uid: string, userData: userDataBank) {
    const collection: AngularFirestoreCollection<userDataBank> = this.firestore
      .collection('Usuarios')
      .doc(uid)
      .collection('DatosTransferencia');

    return collection.add(userData).then((docRef) => {
      userData.IdCuenta = docRef.id;
      return docRef.update(userData);
    });
  }

  borrarDatosTransferencia(uid: string, docId: string) {
    return this.firestore
      .collection('Usuarios')
      .doc(uid)
      .collection('DatosTransferencia')
      .doc(docId)
      .delete();
  }
}




