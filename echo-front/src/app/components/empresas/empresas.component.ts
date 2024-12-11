import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Utils } from '../utils/utils';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { LoginService } from '../auth/login/service/login.service';
import { AutoRefreshService } from '../utils/auto-refresh.service';
import { Empresa } from './model/empresa';
import { TableLazyLoadEvent, Table } from 'primeng/table';
import { Observer } from 'rxjs';
import { EmpresaService } from './service/empresa.service';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css'],
  providers: [MessageService, Utils],
})
export class EmpresasComponent implements OnInit, OnDestroy {
  empresaDialog: boolean = false;

  tituloTela: String = 'Minha(s) Empresa(s)';

  filteredEmpresas: Empresa[] = [];

  filteredEmpresasAdvanced: Empresa[] = [];

  selectedEmpresasAdvanced: Empresa[] = [];

  selectedEmpresas: Empresa[] = [];

  sortOrder: number = 0;

  sortField: string = '';

  empresa: Empresa = {};
  listEmpresas: Empresa[] = [];

  empresaEdit: Empresa = {};

  cols: any[] = [];

  /*
   * Paginator config
   */
  page: number = 1;
  pageSize: number = 15;
  totalEmpresas: number = 0;
  totalPaginas: number = 0;

  rowsPerPageOptions = [5, 10, 20];
  loading: boolean = true;
  globalFilterValue: String = '';

  constructor(
    private empresaService: EmpresaService,
    private messageService: MessageService,
    private loginService: LoginService,
    private router: Router,
    private autoRefreshService: AutoRefreshService
  ) {}

  ngOnInit(): void {
    this.loading = true;
  }

  ngOnDestroy(): void {}

  loadLazyEmpresas(event: TableLazyLoadEvent) {
    const first = event.first || 0;
    this.page = first / this.pageSize + 1;
    this.pageSize = event.rows || 15;
    const filterValue = this.globalFilterValue;

    const observer: Observer<any> = {
      next: (response) => {
        console.log(response.content);
        this.listEmpresas = response.content;
        this.totalEmpresas = response.totalElements;
        this.totalPaginas = response.totalPages;
      },
      error: (err) => {
        const { ok, status, statusTesxt, url } = err;

        this.messageService.add({
          severity: 'error',
          summary: `Erro ${err.status}`,
          detail: `${err.statusText}`,
          life: 3000,
        });
        console.error('Erro ao chamar o serviço:', err);
      },
      complete: () => {
        this.loading = false;
      },
    };

    this.empresaService
      .findPaginate(this.page, this.pageSize, filterValue)
      .subscribe(observer);
  }

  onFilter(dv: Table, event: Event) {
    this.globalFilterValue = (
      event.target as HTMLInputElement
    ).value.toLowerCase();
    this.loadLazyEmpresas({ first: 0, rows: this.pageSize });
  }

  editEmpresa(row: Empresa) {
    this.empresaEdit = { ...row };
    this.empresaDialog = true;
  }

  deleteEmpresa(row: Empresa) {
    const observer: Observer<any> = {
      next: (response) => {
        console.log('Resposta do serviço:', response);
        this.empresaEdit = {};
      },
      error: (err) => {
        const {ok,status,statusTesxt,url} = err;

        this.messageService.add({
          severity: 'error',
          summary: `Erro ${err.status}`,
          detail: `${err.statusText}`,
          life: 3000,
        });
        console.error('Erro ao chamar o serviço:', err);
      },
      complete: () => {
        this.refresh();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Registro excluido com sucesso',
          life: 3000,
        });
      },
    };

    this.empresaService.remove(String(row.id)).subscribe(observer);
  }

  openNewEmpresa() {
    this.empresaEdit = {};
    this.empresaDialog = true;
  }

  saveEmpresa() {
    const observer: Observer<any> = {
      next: (response) => {
        this.empresaDialog = false;
        this.empresaEdit = {};
      },
      error: (err) => {
        const { ok, status, statusTesxt, url } = err;

        this.messageService.add({
          severity: 'error',
          summary: `Erro ${err.status}`,
          detail: `${err.statusText}`,
          life: 3000,
        });
        console.error('Erro ao chamar o serviço:', err);
      },
      complete: () => {
        this.refresh();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Registro salvo com sucesso',
          life: 3000,
        });
      },
    };

    this.empresaService.save(this.empresaEdit).subscribe(observer);
  }
  refresh() {
    this.loadLazyEmpresas({ first: 0, rows: this.pageSize });
  }

  hideDialog() {
    this.empresaDialog = false;
  }

}
