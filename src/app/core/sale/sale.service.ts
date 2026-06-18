import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/api/api.constants';
import { ApiResponse } from '../../core/models/api-response.model';
import { Sale, SaleEstado, SalePayload } from '../../core/models/sale.model';

@Injectable({ providedIn: 'root' })
export class SaleService {
    private http = inject(HttpClient);
    private base = `${API_URL}sale`;

    list(estado?: string): Observable<Sale[]> {
        let params = new HttpParams();
        if (estado) params = params.set('estado', estado);
        return this.http
            .get<ApiResponse<Sale[]>>(`${this.base}/list`, { params })
            .pipe(map(res => res.result ?? []));
    }

    load(id: number): Observable<Sale> {
        return this.http
            .get<ApiResponse<Sale>>(`${this.base}/load/${id}`)
            .pipe(map(res => res.result));
    }

    save(payload: SalePayload): Observable<number> {
        return this.http
            .post<ApiResponse<{ id: number }>>(`${this.base}/save`, payload)
            .pipe(map(res => res.result.id));
    }

    updateEstado(id: number, estado: SaleEstado): Observable<string> {
        return this.http
            .put<ApiResponse<unknown>>(`${this.base}/updateEstado/${id}`, { estado })
            .pipe(map(res => res.message));
    }

    delete(id: number): Observable<string> {
        return this.http
            .delete<ApiResponse<unknown>>(`${this.base}/delete/${id}`)
            .pipe(map(res => res.message));
    }
}