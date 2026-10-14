import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  code = '';
  password = '';
  remember = false;
  showPassword = false;
  submitted = false;
  loading = false;
  apiError = '';
  successMessage = '';

  constructor(private readonly router: Router, private readonly route: ActivatedRoute, private readonly http: HttpClient, private readonly cdr: ChangeDetectorRef) {
    if (this.route.snapshot.queryParamMap.get('senha') === 'alterada') this.successMessage = 'Senha alterada. Entre novamente para continuar.';
  }

  enter(): void {
    this.submitted = true;
    this.apiError = '';
    if (!/^\d{4}$/.test(this.code) || !this.password) return;
    this.loading = true;
    this.http.post<{ nome: string; deve_alterar_senha: boolean }>('/api/auth/login', {
      codigo: this.code, senha: this.password
    }, { withCredentials: true }).pipe(
      timeout(10000),
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: result => { void this.router.navigate([result.deve_alterar_senha ? '/alterar-senha' : '/contrato']); },
      error: (error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        this.apiError = status === 401
          ? 'Código ou senha inválidos.'
          : status === 429
            ? 'Muitas tentativas. Aguarde 15 minutos e tente novamente.'
          : status === 0
            ? 'O servidor não respondeu. Verifique se o backend está iniciado.'
            : 'Não foi possível entrar agora. Tente novamente.';
      }
    });
  }
}
