import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { LayoutComponent } from './features/layout/layout.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    // Ruta pública (sin layout)
    { path: 'login', component: LoginComponent },

    // Zona protegida: todo cuelga del layout (navbar + outlet)
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent },
            // Próximas capas: category, item, user, sale, mi-cuenta
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },

    // Cualquier otra cosa -> home (si no hay sesión, el guard manda a login)
    { path: '**', redirectTo: 'home' }
];