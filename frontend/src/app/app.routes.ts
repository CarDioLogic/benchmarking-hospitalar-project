import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { DescriptionServicePageComponent } from './pages/description-service-page/description-service-page.component';
import { ConsultUsersPageComponent } from './pages/consult-users-page/consult-users-page.component';
import { CreateUserPageComponent } from './pages/create-user-page/create-user-page.component';
import { UpdateIndicatorsPageComponent } from './pages/update-indicators-page/update-indicators-page.component'
import { CreateIndicatorsPageComponent } from './pages/create-indicators-page/create-indicators-page.component'
import { AuthGuard } from './guards/auth.guard';


//o canActivate é um guard que verifica se o user esta com login feito antes de avançar
export const routes: Routes = [
  { path: 'home', component: HomepageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'description', component: DescriptionServicePageComponent },
  { path: 'consultUsers', component: ConsultUsersPageComponent, canActivate: [AuthGuard]},
  { path: 'createUser', component: CreateUserPageComponent, canActivate: [AuthGuard]},
  { path: 'updateIndicators', component: UpdateIndicatorsPageComponent, canActivate: [AuthGuard] },
  { path: 'createIndicator', component: CreateIndicatorsPageComponent,canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];


