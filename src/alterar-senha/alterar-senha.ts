import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'alterar-senha-page',
  imports: [FormsModule],
  templateUrl: './alterar-senha.html',
  styleUrls: ['../login/login.css', './alterar-senha.css']
})
export class AlterarSenha {
  newPassword = '';
  confirmation = '';
  submitted = false;
  loading = false;
  apiError = '';

  constructor(private readonly http: HttpClient, private readonly router: Router, private readonly cdr: ChangeDetectorRef) {}

  get valid(): boolean {
    return this.newPassword.length >= 8 && this.newPassword === this.confirmation;
  }

  save(): void {
    this.submitted = true;
    this.apiError = '';
    if (!this.valid) return;
    this.loading = true;
    this.http.post('/api/auth/alterar-senha', {
      nova_senha: this.newPassword
    }, { withCredentials: true }).pipe(
      timeout(10000),
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => void this.router.navigate(['/login'], { queryParams: { senha: 'alterada' } }),
      error: (error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        this.apiError = status === 400 ? 'A nova senha deve ser diferente da senha temporária.' : 'Não foi possível alterar a senha.';
      }
    });
  }
}
