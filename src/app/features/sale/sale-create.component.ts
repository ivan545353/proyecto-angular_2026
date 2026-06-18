import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { SaleService } from '../../core/sale/sale.service';
import { ItemService } from '../../core/item/item.service';
import { Item } from '../../core/models/item.model';

@Component({
    selector: 'app-sale-create',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
    templateUrl: './sale-create.component.html'
})
export class SaleCreateComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(SaleService);
    private itemService = inject(ItemService);
    private router = inject(Router);

    items = signal<Item[]>([]);
    error = signal<string | null>(null);
    guardando = signal(false);

    // Totales en vivo (recalculados ante cualquier cambio del formulario)
    subtotal = signal(0);
    total = signal(0);

    form = this.fb.group({
        cliente: [''],
        observaciones: [''],
        descuento: [0, [Validators.min(0)]],
        detalles: this.fb.array([])
    });

    get detalles(): FormArray {
        return this.form.get('detalles') as FormArray;
    }

    ngOnInit(): void {
        this.itemService.list().subscribe({
            next: items => this.items.set(items),
            error: () => this.error.set('No se pudieron cargar los productos.')
        });

        this.agregarLinea(); // arranca con una línea
        this.form.valueChanges.subscribe(() => this.recalcular());
    }

    nuevaLinea(): FormGroup {
        return this.fb.group({
            productoId: [null as number | null, [Validators.required]],
            cantidad: [1, [Validators.required, Validators.min(1)]]
        });
    }

    agregarLinea(): void {
        this.detalles.push(this.nuevaLinea());
    }

    quitarLinea(i: number): void {
        this.detalles.removeAt(i);
        this.recalcular();
    }

    precioDe(productoId: number | null): number {
        const item = this.items().find(i => i.id === Number(productoId));
        return item ? Number(item.precio) : 0;
    }

    subtotalLinea(i: number): number {
        const c = this.detalles.at(i).value;
        return this.precioDe(c.productoId) * Number(c.cantidad || 0);
    }

    private recalcular(): void {
        let sub = 0;
        for (let i = 0; i < this.detalles.length; i++) {
            sub += this.subtotalLinea(i);
        }
        const desc = Number(this.form.get('descuento')?.value || 0);
        this.subtotal.set(sub);
        this.total.set(Math.max(sub - desc, 0));
    }

    guardar(): void {
        if (this.form.invalid || this.detalles.length === 0) {
            this.form.markAllAsTouched();
            this.error.set('Revisá los datos: debe haber al menos un producto válido.');
            return;
        }
        if (this.total() <= 0 && this.subtotal() > 0) {
            this.error.set('El descuento no puede ser mayor o igual al subtotal.');
            return;
        }

        this.error.set(null);
        this.guardando.set(true);

        const v = this.form.getRawValue();
        this.service.save({
            cliente: v.cliente ?? '',
            observaciones: v.observaciones ?? '',
            descuento: Number(v.descuento || 0),
            detalles: this.detalles.controls.map(c => ({
                productoId: Number(c.value.productoId),
                cantidad: Number(c.value.cantidad)
            }))
        }).subscribe({
            next: id => this.router.navigate(['/sale/detail', id]),
            error: err => {
                this.error.set(err?.error?.error ?? 'No se pudo registrar la venta.');
                this.guardando.set(false);
            }
        });
    }
}