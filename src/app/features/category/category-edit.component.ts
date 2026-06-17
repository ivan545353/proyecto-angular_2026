import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from './category.service';

@Component({
    selector: 'app-category-edit',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './category-edit.component.html'
})
export class CategoryEditComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(CategoryService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    private id = Number(this.route.snapshot.paramMap.get('id'));
    private nombreOriginal = '';

    editando = signal(false);
    procesando = signal(false);
    error = signal<string | null>(null);

    form = this.fb.group({
        nombre: [{ value: '', disabled: true }, [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\-']+$/)
        ]]
    });

    ngOnInit(): void {
        this.service.load(this.id).subscribe({
            next: cat => {
                this.nombreOriginal = cat.nombre;
                this.form.patchValue({ nombre: cat.nombre });
            },
            error: err => this.error.set(err?.error?.error ?? 'No se encontró la categoría.')
        });
    }

    habilitarEdicion(): void {
        this.editando.set(true);
        this.form.controls.nombre.enable();
    }

    cancelar(): void {
        this.editando.set(false);
        this.form.patchValue({ nombre: this.nombreOriginal });
        this.form.controls.nombre.disable();
        this.error.set(null);
    }

    actualizar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.procesando.set(true);
        this.error.set(null);

        this.service.update({ id: this.id, nombre: this.form.getRawValue().nombre! }).subscribe({
            next: () => this.router.navigate(['/category']),
            error: err => {
                this.error.set(err?.error?.error ?? 'No se pudo actualizar la categoría.');
                this.procesando.set(false);
            }
        });
    }

    eliminar(): void {
        if (!confirm('¿Eliminar esta categoría?')) return;
        this.procesando.set(true);
        this.service.delete(this.id).subscribe({
            next: () => this.router.navigate(['/category']),
            error: err => {
                this.error.set(err?.error?.error ?? 'No se pudo eliminar la categoría.');
                this.procesando.set(false);
            }
        });
    }
}