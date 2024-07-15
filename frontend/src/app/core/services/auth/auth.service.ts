import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoginResponse } from '../../models/login-response.model';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private encryptionKey = 'atec-2024-project';
  private cookieExpirationMinutes = 4 * 60; // Expiração do cookie em minutos (4 horas)

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) { }

  private encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.encryptionKey).toString();
  }

  private decrypt(value: string): string {
    const bytes = CryptoJS.AES.decrypt(value, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  getToken(): string | null {
    return this.cookieService.get('access_token');
  }

  getUserName(): string {
    return this.decrypt(this.cookieService.get('name'));
  }

  getUserEmail(): string {
    return this.decrypt(this.cookieService.get('email'));
  }

  getUserId(): string {
    return this.decrypt(this.cookieService.get('id'));
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<LoginResponse>('/login', { email, password }, { withCredentials: true })
      .pipe(
        map(response => {
          console.log('Login successful:', response); 
          const expirationDate = new Date();
          expirationDate.setTime(expirationDate.getTime() + (this.cookieExpirationMinutes * 60 * 1000));

          this.cookieService.set('access_token', response.access_token, { secure: true, sameSite: 'Strict', expires: expirationDate });
          this.cookieService.set('email', this.encrypt(response.email), { secure: true, sameSite: 'Strict', expires: expirationDate });
          this.cookieService.set('role', this.encrypt(response.role), { secure: true, sameSite: 'Strict', expires: expirationDate });
          this.cookieService.set('name', this.encrypt(response.name), { secure: true, sameSite: 'Strict', expires: expirationDate });
          this.cookieService.set('id', this.encrypt(String(response.id)), { secure: true, sameSite: 'Strict', expires: expirationDate });
          return response;
        }),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(() => new Error('Login failed: ' + error.message));
        })
      );
  }

  register(data: any): Observable<any> {
    return this.http.post('/register', data).pipe(
      catchError(error => throwError(() => new Error('Failed to create user')))
    );
  }

  logout(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const token = this.getToken();
      if (!token) {
        console.error('No token found');
        this.router.navigate(['/login']);
        reject('No token found');
        return;
      }

      this.http.post('/logout', {}, { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }), withCredentials: true })
        .subscribe(
          () => {
            this.cookieService.delete('access_token', '/');
            this.cookieService.delete('role', '/');
            this.cookieService.delete('name', '/');
            this.cookieService.delete('email', '/');
            this.cookieService.delete('id', '/');
            console.log('Logout successful');
            this.router.navigate(['/login']);
            resolve(true);
          },
          error => {
            console.error('Logout failed', error);
            reject(error);
          }
        );
    });
  }

  getRole(): string {
    return this.decrypt(this.cookieService.get('role')).toLowerCase() || 'guest';
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post('/forgot-password', { email });
  }

  resetPassword(email: string, token: string, password: string, passwordConfirmation: string): Observable<any> {
    return this.http.post('/reset-password', { email, token, password, password_confirmation: passwordConfirmation });
  }

  setResetToken(token: string): void {
    this.cookieService.set('password_reset_token', token, { secure: true, sameSite: 'Strict' });
  }

  getResetToken(): string {
    return this.cookieService.get('password_reset_token');
  }
}