import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';
@Component({selector:'cadastro-page',imports:[FormsModule,RouterLink],templateUrl:'./cadastro.html',styleUrl:'./cadastro.css'})
export class Cadastro {
  name='';registration='';email='';phone='';password='';confirmation='';showPassword=false;submitted=false;loading=false;apiError='';
  constructor(private readonly router:Router,private readonly http:HttpClient,private readonly cdr:ChangeDetectorRef){}
  get passwordMismatch():boolean{return !!this.confirmation&&this.password!==this.confirmation}
  createAccount():void{this.submitted=true;this.apiError='';if(!this.name.trim()||!this.registration.trim()||!this.email.trim()||this.password.length<8||this.passwordMismatch||!this.confirmation)return;this.loading=true;this.http.post('/api/auth/cadastro',{nome:this.name.trim(),matricula:this.registration.trim(),email:this.email.trim(),telefone:this.phone.trim()||null,senha:this.password}).pipe(timeout(10000),finalize(()=>{this.loading=false;this.cdr.detectChanges()})).subscribe({next:()=>{void this.router.navigate(['/login'],{queryParams:{cadastro:'sucesso'}})},error:(error:unknown)=>{const status=error instanceof HttpErrorResponse?error.status:0;this.apiError=status===409?'E-mail ou matrícula já cadastrados.':status===0?'O servidor não respondeu. Verifique se o backend está iniciado.':'Não foi possível criar a conta. Confira os dados.'}})}
}
