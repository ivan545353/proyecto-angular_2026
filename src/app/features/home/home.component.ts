import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Pantalla de inicio. Por ahora una bienvenida simple; más adelante
 * se puede convertir en un dashboard con métricas (home/stats).
 */
@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <section class="mb-4">
      <h1 class="h3 text-black">Inicio</h1>
      <p class="text-muted">
        Bienvenido, <strong>{{ auth.usuario()?.cuenta }}</strong>.
        Tu perfil es <strong>{{ auth.perfil() }}</strong>.
      </p>
    </section>
  `
})
export class HomeComponent {
  auth = inject(AuthService);
}