import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { LayoutComponent } from './features/layout/layout.component';
import { HomeComponent } from './features/home/home.component';
import { CategoryIndexComponent } from './features/category/category-index.component';
import { CategoryCreateComponent } from './features/category/category-create.component';
import { CategoryEditComponent } from './features/category/category-edit.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },

    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent },

            // Módulo Categorías (el molde)
            { path: 'category', component: CategoryIndexComponent },
            { path: 'category/create', component: CategoryCreateComponent },
            { path: 'category/edit/:id', component: CategoryEditComponent },

            // Próximas capas: item, user, sale, mi-cuenta
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },

    { path: '**', redirectTo: 'home' }
];