import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { take, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-crud-admin',
  templateUrl: './crud-admin.component.html',
  styleUrls: ['./crud-admin.component.css']
})
export class CrudAdminComponent implements OnInit {
  listUsers: User[] = []; // Lista de usuarios obtenidos desde Firebase
  filteredUsers: User[] = []; // Lista de usuarios filtrados
  uid: string = ''; // UID del usuario actual
  info: User | null = null; // Información del usuario actual
  searchEmail: string = ''; // Correo electrónico para filtrar usuarios
  noResults: boolean = false; // Indicador para mostrar si no hay resultados de búsqueda
  users: any[] = []; // Arreglo genérico de usuarios
  mostrarPrompt: boolean = false; // Indicador para mostrar el diálogo de actualización
  nombreActualizado: string = ''; // Valor actualizado del nombre del usuario
  usuarioActual!: User; // Usuario actual seleccionado
  campoSeleccionado!: string; // Campo seleccionado para actualizar
  campoActualizado!: string; // Valor actualizado del campo seleccionado

  constructor(private firebase: FirebaseService, private auth: AuthService,    private router: Router,
    ) {}

  // Filtrar usuarios en función del correo electrónico ingresado
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
    this.uid = await this.auth.getUid() || ''; // Assign an empty string as fallback for undefined
  
    this.firebase.allUsers$.subscribe((users: User[]) => {
      this.listUsers = users;
      this.filteredUsers = this.listUsers;
      this.filterUsers();
    });
  
    await this.canActivate();
  }
  
  async canActivate(): Promise<boolean> {
    const uid = await this.auth.getUid();
    if (uid) {
      const userProfile = await this.firebase.getUserProfiles(uid).toPromise();
      if (userProfile && userProfile.perfil === 3) {
        return true; // Allow access to the component for users with perfil 3
      } else {
        this.router.navigate(['/index']);
        return false; // Redirect other users to the index
      }
    } else {
      this.router.navigate(['/index']);
      return false; // Redirect unauthenticated users to the index
    }
  }
  
  


  // Mostrar el diálogo de actualización de un campo específico del usuario
  mostrarPromptCampo(user: User, campo: string) {
    this.usuarioActual = user; // Asignar el usuario actual a la variable
    this.campoActualizado = '';
    this.campoSeleccionado = campo;
    this.mostrarPrompt = true;
  }

  // Actualizar el valor de un campo específico del usuario
  actualizarCampo() {
    if (this.campoActualizado.trim() !== '') {
      console.log("El usuario ingresó el valor: " + this.campoActualizado);
      const campo = this.campoSeleccionado;
      const valorActualizado = this.campoActualizado;
      const path = 'Usuarios';
      const id = this.usuarioActual.uid;
      const updateDoc = { [campo]: valorActualizado };
      // Actualizar el documento en Firebase
      this.firebase.updateDoc(path, id, updateDoc).then(() => {
        console.log(`${campo} actualizado con éxito`);
        this.cerrarDialogo();
      });
    }
  }

  // Cerrar el diálogo de actualización
  cerrarDialogo() {
    this.mostrarPrompt = false;
  }

  // Generar y descargar un informe en formato PDF
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

  // Obtener el nombre de un mes en base a su índice
  getMonthName(month: number): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[month];
  }
}
