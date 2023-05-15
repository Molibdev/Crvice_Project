import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { IndexComponent } from './components/index/index.component';
import { EmailValidationComponent } from './components/email-validation/email-validation.component';
import { PublicacionComponent } from './components/publicacion/publicacion.component';
import { NuevaPublicacionComponent } from './components/nueva-publicacion/nueva-publicacion.component';
import { BusquedaComponent } from './components/busqueda/busqueda.component';
import { EditarPublicacionComponent } from './components/editar-publicacion/editar-publicacion.component';
import { MisPublicacionesComponent } from './components/mis-publicaciones/mis-publicaciones.component';
import { ChatComponent } from './components/chat/chat.component';
import { SolicitarTrabajoComponent } from './components/solicitar-trabajo/solicitar-trabajo.component';
import { RespSolicitudComponent } from './components/resp-solicitud/resp-solicitud.component';
import { TrabajosComponent } from './components/trabajos/trabajos.component';
import { ContratacionesComponent } from './components/contrataciones/contrataciones.component';
import { RespTrabajoComponent } from './components/resp-trabajo/resp-trabajo.component';
import { CalificacionComponent } from './components/calificacion/calificacion.component';
import { MapaComponent } from './components/mapa/mapa.component';
import { PagoComponent } from './components/pago/pago.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'index', component: IndexComponent },
  { path: 'login', component: LoginComponent },
  { path: 'busqueda/:termino', component: BusquedaComponent },
  { path: 'nueva-publicacion', component: NuevaPublicacionComponent,
  ...canActivate(() => redirectUnauthorizedTo(['/login'])) },
  { path: 'mis-publicaciones', component: MisPublicacionesComponent },
  { path: 'resp-solicitud', component: RespSolicitudComponent },
  { path: 'resp-trabajo', component: RespTrabajoComponent },
  { path: 'solicitudes', component: TrabajosComponent },
  { path: 'contrataciones', component: ContratacionesComponent },
  { path: 'editar-publicacion/:id', component: EditarPublicacionComponent },
  { path: 'publicacion/:id', component: PublicacionComponent },
  { path: 'email-validation', component: EmailValidationComponent, 
  ...canActivate(() => redirectUnauthorizedTo(['/login'])) },
  { path: 'chat', component: ChatComponent },
  { path: 'forgot-pass', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent,
  ...canActivate(() => redirectUnauthorizedTo(['/login']))}, 
  { path: 'solicitar-trabajo/:id/:uid/:currentUserUid', component: SolicitarTrabajoComponent },
  { path: 'calificacion', component: CalificacionComponent },
  { path: 'mapa', component: MapaComponent },
  { path: 'pago', component: PagoComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
