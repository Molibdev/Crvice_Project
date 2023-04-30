import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { User } from '../models/models';
import { authState ,Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser$ = authState(this.auth);

  constructor(private authfirebase: AngularFireAuth, private auth: Auth) { }

  login(correo: string, password: string){
    return this.authfirebase.signInWithEmailAndPassword(correo, password)
  }

  async verificationEmail(): Promise <void>  {
    return (await this.authfirebase.currentUser)?.sendEmailVerification();
  }


  logout(){
    this.authfirebase.signOut();
  }

  // register(datos: User) {
  //   this.verificationEmail();
  //   console.log('Email  de verificacion enviado')
  //   return this.authfirebase.createUserWithEmailAndPassword(datos.correo, datos.password);
  // }

  

  async register(datos: User) {
    const userCredential = await this.authfirebase.createUserWithEmailAndPassword(datos.correo, datos.password);
    console.log('Usuario creado');
    this.verificationEmail();
    console.log('Email de verificación enviado');
    return userCredential;
  }

  

  async resetPass(correo: string) {
    try{
      return this.authfirebase.sendPasswordResetEmail(correo);
    }
    catch(error){
      console.log(error)
    }
  }


  stateUser(){
    return this.authfirebase.authState
  }

  async getUid() {
    const user = await this.authfirebase.currentUser
    return user?.uid;

  }


}
