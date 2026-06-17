import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from './category.service';
import { Category } from '../../core/models/category.model';

@Component({
    selector: 'app-category-index',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './category-index.component.html'
})
export class CategoryIndexComponent implements OnInit {
    private service = inject(CategoryService);

    categorias = signal<Category[]>([]);
    filtro = signal('');
    cargando = signal(false);
    error = signal<string | null>(null);

    // Filtrado en el cliente por nombre (derivado de los datos + el filtro)
    categoriasFiltradas = computed(() => {
        const f = this.filtro().toLowerCase().trim();
        const lista = this.categorias();
        return f ? lista.filter(c => c.nombre.toLowerCase().includes(f)) : lista;
    });

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.cargando.set(true);
        this.error.set(null);
        this.service.list().subscribe({
            next: cats => { this.categorias.set(cats); this.cargando.set(false); },
            error: err => {
                this.error.set(err?.error?.error ?? 'No se pudieron cargar las categorías.');
                this.cargando.set(false);
            }
        });
    }

    eliminar(cat: Category): void {
        if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
        this.service.delete(cat.id).subscribe({
            next: () => this.categorias.update(list => list.filter(c => c.id !== cat.id)),
            error: err => alert(err?.error?.error ?? 'No se pudo eliminar la categoría.')
        });
    }
}