import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../core/sale/sale.service';
import { Sale, SaleEstado } from '../../core/models/sale.model';
import { AuthService } from '../../core/auth/auth.service';

@Component({
    selector: 'app-sale-detail',
    standalone: true,
    imports: [RouterLink, DatePipe, DecimalPipe],
    templateUrl: './sale-detail.component.html'
})
export class SaleDetailComponent implements OnInit {
    private service = inject(SaleService);
    private auth = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    private id = Number(this.route.snapshot.paramMap.get('id'));

    venta = signal<Sale | null>(null);
    error = signal<string | null>(null);
    procesando = signal(false);

    private perfil = computed(() => this.auth.perfil() ?? '');
    esAdmin = computed(() => this.perfil() === 'Administrador');
    esVendedor = computed(() => this.perfil() === 'Vendedor');
    esCaja = computed(() => this.perfil() === 'Caja');

    // Reglas de quién puede hacer qué, según estado + perfil
    puedeConfirmar = computed(() =>
        this.venta()?.estado === 'presupuesto' && (this.esAdmin() || this.esVendedor()));
    puedeCobrar = computed(() =>
        this.venta()?.estado === 'confirmada' && (this.esAdmin() || this.esCaja()));
    puedeAnular = computed(() => {
        const e = this.venta()?.estado;
        if (!e || e === 'anulada') return false;
        if (this.esAdmin()) return true;
        return this.esVendedor() && e === 'presupuesto';
    });
    puedeEliminar = computed(() =>
        this.venta()?.estado === 'presupuesto' && (this.esAdmin() || this.esVendedor()));

    badgeClass = computed(() => {
        switch (this.venta()?.estado) {
            case 'presupuesto': return 'text-bg-warning';
            case 'confirmada': return 'text-bg-info';
            case 'cobrada': return 'text-bg-success';
            case 'anulada': return 'text-bg-secondary';
            default: return 'text-bg-light';
        }
    });

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.service.load(this.id).subscribe({
            next: v => this.venta.set(v),
            error: err => this.error.set(err?.error?.error ?? 'No se encontró la venta.')
        });
    }

    cambiarEstado(nuevo: SaleEstado, mensaje: string): void {
        if (!confirm(mensaje)) return;
        this.procesando.set(true);
        this.error.set(null);
        this.service.updateEstado(this.id, nuevo).subscribe({
            next: () => { this.procesando.set(false); this.cargar(); },
            error: err => {
                this.error.set(err?.error?.error ?? 'No se pudo cambiar el estado.');
                this.procesando.set(false);
            }
        });
    }

    eliminar(): void {
        if (!confirm('¿Eliminar este presupuesto?')) return;
        this.procesando.set(true);
        this.service.delete(this.id).subscribe({
            next: () => this.router.navigate(['/sale']),
            error: err => {
                this.error.set(err?.error?.error ?? 'No se pudo eliminar.');
                this.procesando.set(false);
            }
        });
    }
}