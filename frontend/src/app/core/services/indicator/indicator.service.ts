import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Indicator } from '../../models/indicator.model';
import { Filter } from '../../models/filter.model';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class IndicatorService {
  private cache: { [key: string]: any } = {};

  constructor(private http: HttpClient) { }

  private getHttpParams(filter: Filter): HttpParams {
    return new HttpParams()
      .set('serviceId', filter.serviceId?.toString() || '0')
      .set('activityId', filter.activityId?.toString() || '')
      .set('indicatorId', filter.indicatorId?.toString() || '0')
      .set('year', filter.year?.toString() || '0')
      .set('month', filter.month?.toString() || '0');
  }

  private getCacheKey(filter: Filter): string {
    return `${filter.year}-${filter.month}-${filter.indicatorId}-${filter.activityId}-${filter.serviceId}`;
  }

  getAllData(filter: Filter): Observable<any> {
    const cacheKey = this.getCacheKey(filter);
    if (this.cache[cacheKey]) {
      return of(this.cache[cacheKey]);
    }

    return forkJoin({
      recordsMensal: this.getRecordsMensal(filter),
      recordsAnual: this.getRecordsAnual(filter),
      recordsAnualLastYear: this.getRecordsLastYear(filter),
      goalsMensal: this.getGoalsMensal(filter),
      goalMes: this.getGoalMes(filter),
      goalAnual: this.getGoalAnual(filter),
      previousYearTotal: this.getPreviousYearTotal(filter),
      currentYearTotal: this.getCurrentYearTotal(filter),
      variations: this.getVariations(filter),
    }).pipe(
      tap(data => this.cache[cacheKey] = data)
    );
  }

  getRecordsMensal(filter: Filter): Observable<any> {
    const params = this.getHttpParams(filter);
    return this.http.get<any>('/indicators/sai/records-mensal', { params });
  }

  getRecordsAnual(filter: Filter): Observable<any> {
    const params = this.getHttpParams(filter);
    return this.http.get<any>('/indicators/sai/records-anual', { params });
  }

  getRecordsLastYear(filter: Filter): Observable<any> {
    const params = this.getHttpParams(filter);
    return this.http.get<any>('/indicators/sai/records-last-year', { params });
  }

  getGoalsMensal(filter: Filter): Observable<any> {
    const params = this.getHttpParams(filter);
    return this.http.get<any>('/indicators/sai/goals-mensal', { params });
  }

  getGoalMes(filter: Filter): Observable<any> {
    const params = this.getHttpParams(filter);
    return this.http.get<any>('/indicators/sai/goal-mes', { params });
  }

  getGoalAnual(filter: Filter): Observable<any> {
    const params = this.getHttpParams(filter);
    return this.http.get<any>('/indicators/sai/goal-anual', { params });
  }

  getPreviousYearTotal(filter: Filter): Observable<any> {
    const params = this.getHttpParams(filter);
    return this.http.get<any>('/indicators/sai/previous-year-total', { params });
  }

  getCurrentYearTotal(filter: Filter): Observable<any> {
    const params = this.getHttpParams(filter);
    return this.http.get<any>('/indicators/sai/current-year-total', { params });
  }

  getVariations(filter: Filter): Observable<any> {
    const params = this.getHttpParams(filter);
    return this.http.get<any>('/indicators/sai/variations', { params });
  }

  // Restante dos métodos...

  indexIndicators(): Observable<Indicator[]> {
    return this.http.get<Indicator[]>('/indicators').pipe(
      catchError(error => throwError(() => new Error('Failed to fetch indicators')))
    );
  }

  getIndicatorsPaginated(pageIndex: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`/indicators/paginated?page=${pageIndex}&size=${pageSize}`).pipe(
      catchError(error => throwError(() => new Error('Failed to fetch paginated indicators')))
    );
  }

  getSAIPaginated(pageIndex: number, pageSize: number): Observable<any[]> {
    return this.http.get<any>(`/indicators/sai/paginated?page=${pageIndex}&size=${pageSize}`).pipe(
      catchError(error => {
        console.error('Error fetching service activity indicators:', error);
        return throwError(() => new Error('Failed to fetch service activity indicators'));
      })
    );
  }

  getIndicatorsRecords(serviceId: number, activityId: number | null, year: number, month: number, pageIndex: number, pageSize: number): Observable<any> {
    const params = new HttpParams()
      .set('serviceId', serviceId)
      .set('activityId', activityId !== null ? activityId.toString() : '')
      .set('year', year.toString())
      .set('month', month.toString())
      .set('page', (pageIndex + 1).toString())
      .set('size', pageSize.toString());
    console.log('params >>', params.toString());

    return this.http.get<any>('/indicators/sai/records', { params }).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(() => new Error('Falha ao buscar indicadores com registros'));
      })
    );
  }

  getIndicatorsGoals(serviceId: number, activityId: number | null, year: number, pageIndex: number, pageSize: number): Observable<any> {
    const params = new HttpParams()
      .set('serviceId', serviceId)
      .set('activityId', activityId !== null ? activityId : '')
      .set('year', year)
      .set('page', (pageIndex + 1))
      .set('size', pageSize);
    console.log('params >>', params.toString());

    return this.http.get<any>('/indicators/sai/goals', { params }).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(() => new Error('Falha ao buscar indicadores c / metas'));
      })
    );
  }

  storeIndicator(indicator: Indicator): Observable<Indicator> {
    return this.http.post<Indicator>('/indicators', indicator).pipe(
      catchError(error => throwError(() => new Error('Failed to create indicator')))
    );
  }

  showIndicator(id: number): Observable<Indicator> {
    return this.http.get<Indicator>(`/indicators/${id}`).pipe(
      catchError(error => throwError(() => new Error('Failed to fetch indicator')))
    );
  }

  updateIndicator(id: number, indicator: Indicator): Observable<Indicator> {
    return this.http.put<Indicator>(`/indicators/${id}`, indicator).pipe(
      catchError(error => throwError(() => new Error('Failed to update indicator')))
    );
  }

  destroyIndicator(id: number): Observable<any> {
    return this.http.delete(`/indicators/${id}`).pipe(
      catchError(error => throwError(() => new Error('Failed to delete indicator')))
    );
  }
}