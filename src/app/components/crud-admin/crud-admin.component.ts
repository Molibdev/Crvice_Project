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
  filteredUsers: User[] = [];
  uid: string = ''
  info: User | null = null;
  searchEmail: string = '';
  noResults: boolean = false;
  users: any[] = [];
  mostrarPrompt: boolean = false;
  nombreActualizado: string = '';
  usuarioActual!: User; 
  campoSeleccionado!: string;
  campoActualizado!: string;
  

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


  mostrarPromptCampo(user: User, campo: string) {
    this.usuarioActual = user; // Asignar el usuario actual a la variable
    this.campoActualizado = '';
    this.campoSeleccionado = campo;
    this.mostrarPrompt = true;
  }
  
  actualizarCampo() {
    if (this.campoActualizado.trim() !== '') {
      console.log("El usuario ingresó el valor: " + this.campoActualizado);
      const campo = this.campoSeleccionado;
      const valorActualizado = this.campoActualizado;
      const path = 'Usuarios';
      const id = this.usuarioActual.uid;
      const updateDoc = { [campo]: valorActualizado };
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log(`${campo} actualizado con éxito`);
        this.cerrarDialogo();
      });
    }
  }
  
  cerrarDialogo() {
    this.mostrarPrompt = false;
  }
  
}




