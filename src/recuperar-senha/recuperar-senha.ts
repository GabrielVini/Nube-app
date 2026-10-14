import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'recuperar-senha-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.css'
})
export class RecuperarSenha {
  code = '';
  submitted = false;
  sent = false;
  loading = false;
  apiError = '';

  constructor(private readonly http: HttpClient, private readonly cdr: ChangeDetectorRef) {}

  send(): void {
    this.submitted = true;
    this.apiError = '';
    if (!/^\d{4}$/.test(this.code)) return;
    this.loading = true;
    this.http.post('/api/auth/esqueci-senha', { codigo: this.code }).pipe(
      timeout(20000),
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => { this.sent = true; },
      error: (error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        this.apiError = status === 503
          ? 'O envio de e-mail ainda não está configurado. Fale com a administração.'
          : status === 0
            ? 'O servidor não respondeu.'
            : 'Não foi possível solicitar a recuperação agora.';
      }
    });
  }
}
