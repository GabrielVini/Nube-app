import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { Contrato } from './contrato';

describe('Contrato', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contrato],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
  });

  it('deve criar o gerador de contratos', () => {
    const fixture = TestBed.createComponent(Contrato);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve exibir o título da página', async () => {
    const fixture = TestBed.createComponent(Contrato);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('Dados do estágio');
  });

  it('deve organizar o contrato NEO em seis páginas', async () => {
    const fixture = TestBed.createComponent(Contrato);
    await fixture.whenStable();
    expect(fixture.componentInstance.totalPages).toBe(6);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.contract-page').length).toBe(6);
    expect((fixture.nativeElement as HTMLElement).querySelector('.contract-page.active')).toBeTruthy();
  });

  it('deve avançar e voltar as páginas do carrossel', () => {
    const fixture = TestBed.createComponent(Contrato);
    const component = fixture.componentInstance;
    component.nextPage();
    expect(component.currentPage).toBe(1);
    component.previousPage();
    expect(component.currentPage).toBe(0);
  });

  it('deve formatar CPF e CNPJ limitando a quantidade de dígitos', () => {
    const component = TestBed.createComponent(Contrato).componentInstance;
    expect(component.formatCpf('1234567890199')).toBe('123.456.789-01');
    expect(component.formatCnpj('1234567800019999')).toBe('12.345.678/0001-99');
    expect(component.formatCnpj('00000000e08g12')).toBe('00.000.000/E08G-12');
  });

  it('deve exibir o período selecionado no formato do contrato', () => {
    const component = TestBed.createComponent(Contrato).componentInstance;
    expect(component.periodOptions).toHaveLength(16);
    expect(component.period('4')).toBe('4 - Período');
  });

  it('deve oferecer até 30 horas e formatar a carga semanal', () => {
    const component = TestBed.createComponent(Contrato).componentInstance;
    expect(component.weeklyHourOptions).toHaveLength(30);
    expect(component.weeklyHourOptions.at(-1)).toBe('30');
    expect(component.weeklyHours('1')).toBe('1 hora semanal');
    expect(component.weeklyHours('30')).toBe('30 horas semanais');
  });

  it('deve tratar a data final do contrato como variável', async () => {
    const fixture = TestBed.createComponent(Contrato);
    fixture.componentInstance.data.signatureDate = '2026-09-16';
    fixture.detectChanges();
    await fixture.whenStable();
    const finalPage = (fixture.nativeElement as HTMLElement).querySelector('.contract-page:last-child');
    expect(finalPage?.textContent).toContain('16 de setembro de 2026');
  });

  it('deve confirmar, encerrar a sessão e voltar ao login', () => {
    const component = TestBed.createComponent(Contrato).componentInstance;
    const http = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.logout();
    http.expectOne('/api/auth/logout').flush(null);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
