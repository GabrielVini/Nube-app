import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

type ContractData = Record<
  | 'internName' | 'course' | 'educationInstitution' | 'internCpf' | 'registration'
  | 'academicPeriod' | 'internAddress' | 'academicRecord' | 'companyName'
  | 'companyCnpj' | 'companyAddress' | 'companyRepresentative'
  | 'companyRepresentativeRole' | 'institutionAddress' | 'institutionRepresentative'
  | 'institutionRepresentativeRole' | 'weeklyHours' | 'startDate' | 'endDate'
  | 'activities' | 'scholarship' | 'transportAllowance' | 'signatureCity'
  | 'signatureDate', string
>;

@Component({ selector: 'contrato-root', imports: [FormsModule], templateUrl: './contrato.html', styleUrl: './contrato.css' })
export class Contrato {
  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  activeSection = 'estagiario';
  folderOpen = true;
  mobileMenuOpen = false;
  currentPage = 0;
  readonly totalPages = 6;
  readonly periodOptions = Array.from({ length: 16 }, (_, index) => String(index + 1));
  readonly weeklyHourOptions = Array.from({ length: 30 }, (_, index) => String(index + 1));
  data: ContractData = {
    internName: '', course: '', educationInstitution: '', internCpf: '', registration: '',
    academicPeriod: '', internAddress: '', academicRecord: '', companyName: '', companyCnpj: '',
    companyAddress: '', companyRepresentative: '', companyRepresentativeRole: '', institutionAddress: '',
    institutionRepresentative: '', institutionRepresentativeRole: '', weeklyHours: '', startDate: '',
    endDate: '', activities: '', scholarship: '', transportAllowance: '', signatureCity: 'Guarulhos',
    signatureDate: ''
  };
  sections = [
    { id: 'estagiario', label: 'Estagiário', icon: '01' },
    { id: 'empresa', label: 'Concedente', icon: '02' },
    { id: 'instituicao', label: 'Instituição', icon: '03' },
    { id: 'estagio', label: 'Condições', icon: '04' },
    { id: 'assinatura', label: 'Assinatura', icon: '05' }
  ];
  private readonly requiredFields: (keyof ContractData)[] = [
    'internName', 'course', 'educationInstitution', 'internCpf', 'registration', 'academicPeriod',
    'internAddress', 'academicRecord', 'companyName', 'companyCnpj', 'companyAddress',
    'companyRepresentative', 'companyRepresentativeRole', 'institutionAddress',
    'institutionRepresentative', 'institutionRepresentativeRole', 'weeklyHours', 'startDate',
    'endDate', 'activities', 'scholarship', 'transportAllowance', 'signatureCity', 'signatureDate'
  ];
  get completedFields(): number { return this.requiredFields.filter(key => this.data[key].trim()).length; }
  get totalFields(): number { return this.requiredFields.length; }
  get progress(): number { return Math.round(this.completedFields / this.totalFields * 100); }
  goTo(section: string): void { this.activeSection = section; this.mobileMenuOpen = false; document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  next(section: string): void { this.goTo(section); }
  previousPage(): void { if (this.currentPage > 0) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages - 1) this.currentPage++; }
  printContract(): void { window.print(); }
  logout(): void {
    if (!confirm('Deseja realmente sair do projeto?')) return;
    this.http.post('/api/auth/logout', {}, { withCredentials: true }).subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => void this.router.navigate(['/login'])
    });
  }
  clearForm(): void {
    if (!confirm('Deseja limpar todos os campos do contrato?')) return;
    Object.keys(this.data).forEach(key => this.data[key as keyof ContractData] = '');
    this.data.signatureCity = 'Guarulhos';
    this.goTo('estagiario');
  }
  value(value: string, fallback = '________________________________'): string { return value?.trim() || fallback; }
  formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
  }
  formatCnpj(value: string): string {
    const input = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const characters: string[] = [];
    for (const character of input) {
      if (characters.length < 12 || (characters.length < 14 && /\d/.test(character))) characters.push(character);
      if (characters.length === 14) break;
    }
    const cnpj = characters.join('');
    if (cnpj.length <= 2) return cnpj;
    if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
  }
  period(value: string): string { return value ? `${value} - Período` : ''; }
  weeklyHours(value: string): string { return value ? `${value} ${value === '1' ? 'hora semanal' : 'horas semanais'}` : ''; }
  date(value: string): string { if (!value) return '____/____/________'; const [year, month, day] = value.split('-'); return `${day}/${month}/${year}`; }
  longDate(value: string): string { if (!value) return '____ de ______________ de ________'; return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); }
  money(value: string): string {
    if (!value) return 'R$ (________________)';
    const amount = Number(value.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(amount) ? amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : `R$ ${value}`;
  }
}
