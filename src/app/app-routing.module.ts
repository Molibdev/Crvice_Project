import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { IndexComponent } from './components/index/index.component';
import { EmailValidationComponent } from './components/email-validation/email-validation.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'index', component: IndexComponent },
  { path: 'login', component: LoginComponent },
  { path: 'email-validation', component: EmailValidationComponent, 
  ...canActivate(() => redirectUnauthorizedTo(['/login'])) },
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
