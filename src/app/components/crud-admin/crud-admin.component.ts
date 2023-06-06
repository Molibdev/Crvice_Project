import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

// Rest of the code for generating the PDF report

// Rest of the code for generating the PDF report




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
  


  generatePdfLink(): void {
    const content = [];
    const headers = ['UID', 'Nombre y Apellido', 'Email', 'Calificaciones'];
    const data = [];
  
    // Agregar título
    const title = { text: 'CRVICE', style: 'title', alignment: 'center' };
    content.push(title);
  
    const subtitle = { text: 'Informe de Usuarios', style: 'subtitle', alignment: 'center' };
    content.push(subtitle);
  
    // Agregar fecha
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} de ${this.getMonthName(currentDate.getMonth())} de ${currentDate.getFullYear()}`;
    const date = { text: `Fecha: ${formattedDate}`, style: 'date', alignment: 'center' };
    content.push(date);
  
    // Agregar encabezados
    const headerRow = headers.map(header => ({ text: header, style: 'tableHeader' }));
    data.push(headerRow);
  
    // Agregar filas de datos
    this.filteredUsers.forEach(user => {
      const row = [
        { text: user.uid },
        { text: `${user.nombre} ${user.apellido}` },
        { text: user.correo },
        {
          stack: [
            { text: `Número de Calificaciones: ${user.NumeroCalificaciones || 0}` },
            { text: `Calificación Promedio: ${user.PromedioCalificaciones || 0}` }
          ]
        }
      ];
      data.push(row);
    });
  
    // Agregar contenido al documento
    content.push({
      table: {
        headerRows: 1,
        widths: ['25%', '25%', '25%', '25%'], // Ajustar el ancho de las columnas
        body: data
      }
    });
  
    // Definir estilos del documento
    const styles = {
      // Estilo para el título
      title: { fontSize: 24, bold: true, alignment: 'center', margin: [0, 0, 0, 10] as [number, number, number, number] },
      // Estilo para el subtítulo
      subtitle: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 10] as [number, number, number, number] },
      // Estilo para la fecha
      date: { fontSize: 12, margin: [0, 0, 0, 10] as [number, number, number, number] },
      // Estilo para el encabezado de la tabla (sin cambios)
      tableHeader: { bold: true, fillColor: '#eeeeee' }
    };
  
    // Definir documento PDF
    const docDefinition: any = { // Ajuste en la asignación de tipos
      content: content,
      styles: styles
    };
    // Generar y descargar el PDF
    pdfMake.createPdf(docDefinition).download('InformeUsuarios.pdf');
  }
  
  getMonthName(month: number): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[month];
  }
  
}
