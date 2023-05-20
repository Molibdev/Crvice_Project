import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';


@Component({
  selector: 'app-crud-admin',
  templateUrl: './crud-admin.component.html',
  styleUrls: ['./crud-admin.component.css']
})
export class CrudAdminComponent implements OnInit{

  listUsers: User[] = [];
  filteredUsers: any[] = [];
  uid: string = ''
  info: User | null = null;
  searchEmail: string = '';
  noResults: boolean = false;

  constructor(private firebase: FirebaseService, private auth: AuthService) {}


  filterUsers() {
    if (this.searchEmail === '') {
      this.filteredUsers = this.listUsers;
      this.noResults = false;
    } else {
      this.filteredUsers = this.listUsers.filter(user =>
        user.uid.toLowerCase().includes(this.searchEmail.toLowerCase()) ||
        user.correo.toLowerCase().includes(this.searchEmail.toLowerCase())
      );
      this.noResults = this.filteredUsers.length === 0;
    }
  }

  

  async ngOnInit() {
    this.uid = (await this.auth.getUid()) || '';
    this.firebase.allUsers$.subscribe((users: User[]) => {
      this.listUsers = users;
      this.filteredUsers = this.listUsers; // Asignar todos los usuarios a filteredUsers
      this.filterUsers(); // Aplicar el filtro inicialmente
    });
  }
  


  canActivate(): void {
    const userProfile = this.firebase.getUserProfile; // Replace with your own method to get the user's profile
    console.log(userProfile);
  }


  // Editar Nombre

  mostrarPromptNombre(user: User) {
    const nombre = prompt("Ingrese Nombre para actualizar:");
    if (nombre != null) {
      console.log("El usuario ingresó el valor: " + nombre);
      const usuario = { nombre: nombre };
      this.saveNombre(user, usuario); // Pasar el usuario como argumento adicional
    }
  }

  saveNombre(user: User, usuario: any) {
    const path = 'Usuarios';
    const id = user.uid; // Obtener el ID del usuario actual
    const updateDoc = {
      nombre: usuario.nombre
    };
    this.firebase.updateDoc(path, id, updateDoc).then(() => {
      console.log('Nombre Actualizado con exito')
    })
  }

    // Editar Apellido

    mostrarPromptApellido(user: User) {
      const apellido = prompt("Ingrese apellido para actualizar:");
      if (apellido != null) {
        console.log("El usuario ingresó el valor: " + apellido);
        const usuario = { apellido: apellido };
        this.saveApellido(user, usuario); // Pasar el usuario como argumento adicional
      }
    }
  
    saveApellido(user: User, usuario: any) {
      const path = 'Usuarios';
      const id = user.uid; // Obtener el ID del usuario actual
      const updateDoc = {
        apellido: usuario.apellido
      };
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log('Apellido Actualizado con exito')
      })
    }

    // Editar Rut

    mostrarPromptRut(user: User) {
      const rut = prompt("Ingrese rut para actualizar:");
      if (rut != null) {
        console.log("El usuario ingresó el valor: " + rut);
        const usuario = { rut: rut };
        this.saveRut(user, usuario); // Pasar el usuario como argumento adicional
      }
    }
  
    saveRut(user: User, usuario: any) {
      const path = 'Usuarios';
      const id = user.uid; // Obtener el ID del usuario actual
      const updateDoc = {
        rut: usuario.rut
      };
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log('Rut Actualizado con exito')
      })
    }

    // Editar Digito Verificador

    mostrarPromptDv(user: User) {
      const dv = prompt("Ingrese dv para actualizar:");
      if (dv != null) {
        console.log("El usuario ingresó el valor: " + dv);
        const usuario = { dv: dv };
        this.saveDv(user, usuario); // Pasar el usuario como argumento adicional
      }
    }
  
    saveDv(user: User, usuario: any) {
      const path = 'Usuarios';
      const id = user.uid; // Obtener el ID del usuario actual
      const updateDoc = {
        dv: usuario.dv
      };
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log('DV Actualizado con exito')
      })
    }

    // Editar Telefono

    mostrarPromptTelefono(user: User) {
      const telefono = prompt("Ingrese telefono para actualizar:");
      if (telefono != null) {
        console.log("El usuario ingresó el valor: " + telefono);
        const usuario = { telefono: telefono };
        this.saveTelefono(user, usuario); // Pasar el usuario como argumento adicional
      }
    }
  
    saveTelefono(user: User, usuario: any) {
      const path = 'Usuarios';
      const id = user.uid; // Obtener el ID del usuario actual
      const updateDoc = {
        telefono: usuario.telefono
      };
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log('Telefono Actualizado con exito')
      })
    }

    // Editar Direccion

    mostrarPromptDireccion(user: User) {
      const direccion = prompt("Ingrese direccion para actualizar:");
      if (direccion != null) {
        console.log("El usuario ingresó el valor: " + direccion);
        const usuario = { direccion: direccion };
        this.saveDireccion(user, usuario); // Pasar el usuario como argumento adicional
      }
    }
  
    saveDireccion(user: User, usuario: any) {
      const path = 'Usuarios';
      const id = user.uid; // Obtener el ID del usuario actual
      const updateDoc = {
        direccion: usuario.direccion
      };
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log('Direccion Actualizado con exito')
      })
    }

    // Editar Numero de la direccion

    mostrarPromptNumDireccion(user: User) {
      const numDireccion = prompt("Ingrese Numero de la direccion para actualizar:");
      if (numDireccion != null) {
        console.log("El usuario ingresó el valor: " + numDireccion);
        const usuario = { numDireccion: numDireccion };
        this.saveNumDireccion(user, usuario); // Pasar el usuario como argumento adicional
      }
    }
  
    saveNumDireccion(user: User, usuario: any) {
      const path = 'Usuarios';
      const id = user.uid; // Obtener el ID del usuario actual
      const updateDoc = {
        numDireccion: usuario.numDireccion
      };
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log('Numero Direccion Actualizado con exito')
      })
    }

    // Editar Comuna

    mostrarPromptComuna(user: User) {
      const comuna = prompt("Ingrese comuna para actualizar:");
      if (comuna != null) {
        console.log("El usuario ingresó el valor: " + comuna);
        const usuario = { comuna: comuna };
        this.saveComuna(user, usuario); // Pasar el usuario como argumento adicional
      }
    }
  
    saveComuna(user: User, usuario: any) {
      const path = 'Usuarios';
      const id = user.uid; // Obtener el ID del usuario actual
      const updateDoc = {
        comuna: usuario.comuna
      };
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log('Comuna Actualizado con exito')
      })
    }

    // Editar Correo

    mostrarPromptCorreo(user: User) {
      const correo = prompt("Ingrese correo para actualizar:");
      if (correo != null) {
        console.log("El usuario ingresó el valor: " + correo);
        const usuario = { correo: correo };
        this.saveCorreo(user, usuario); // Pasar el usuario como argumento adicional
      }
    }
  
    saveCorreo(user: User, usuario: any) {
      const path = 'Usuarios';
      const id = user.uid; // Obtener el ID del usuario actual
      const updateDoc = {
        correo: usuario.correo
      };
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log('correo Actualizado con exito')
      })
    }

    // Editar Nacimiento

    mostrarPromptNacimiento(user: User) {
      const nacimiento = prompt("Ingrese fecha de nacimiento para actualizar:");
      if (nacimiento != null) {
        console.log("El usuario ingresó el valor: " + nacimiento);
        const usuario = { nacimiento: nacimiento };
        this.saveNacimiento(user, usuario); // Pasar el usuario como argumento adicional
      }
    }
  
    saveNacimiento(user: User, usuario: any) {
      const path = 'Usuarios';
      const id = user.uid; // Obtener el ID del usuario actual
      const updateDoc = {
        nacimiento: usuario.nacimiento
      };
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log('Fecha de nacimiento actualizada con exito')
      })
    }

    // Editar Tipo de cuenta

    mostrarPromptTipoCuenta(user: User) {
      const perfil = prompt("Ingrese Tipo de cuenta del usuario para actualizar:");
      if (perfil != null) {
        console.log("El usuario ingresó el valor: " + perfil);
        const usuario = { perfil: perfil };
        this.saveTipoCuenta(user, usuario); // Pasar el usuario como argumento adicional
      }
    }
  
    saveTipoCuenta(user: User, usuario: any) {
      const path = 'Usuarios';
      const id = user.uid; // Obtener el ID del usuario actual
      const updateDoc = {
        perfil: usuario.perfil
      };
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log('Tipo de cuenta de usuario actualizada con exito')
      })
    }

    





}




