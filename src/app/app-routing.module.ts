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

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'index', component: IndexComponent },
  { path: 'login', component: LoginComponent },
  { path: 'busqueda', component: BusquedaComponent },
  { path: 'nueva-publicacion', component: NuevaPublicacionComponent },
  { path: 'mis-publicaciones', component: MisPublicacionesComponent },
  { path: 'editar-publicacion/:id', component: EditarPublicacionComponent },
  { path: 'publicacion/:id', component: PublicacionComponent },
  { path: 'email-validation', component: EmailValidationComponent, 
  ...canActivate(() => redirectUnauthorizedTo(['/login'])) },
  { path: 'chat', component: ChatComponent },
  { path: 'forgot-pass', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent,
  ...canActivate(() => redirectUnauthorizedTo(['/login']))
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
