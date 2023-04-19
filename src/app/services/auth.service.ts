import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private authfirebase: AngularFireAuth) { }

  login(correo: string, password: string){
    return this.authfirebase.signInWithEmailAndPassword(correo, password)
  }

  logout(){
    this.authfirebase.signOut();
  }

  register(datos: User) {
    return this.authfirebase.createUserWithEmailAndPassword(datos.correo, datos.password)
  }

  stateUser(){
    return this.authfirebase.authState
  }

  async getUid() {
    const user = await this.authfirebase.currentUser
    return user?.uid;

  }


}
