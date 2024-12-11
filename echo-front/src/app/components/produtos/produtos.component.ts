import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Utils } from '../utils/utils';
import { Router } from '@angular/router';
import { LoginService } from '../auth/login/service/login.service';
import { ProdutoService } from '../produtos/service/produto.service';
import { AutoRefreshService } from '../utils/auto-refresh.service';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { Produto } from './model/produto';
import { Observer } from 'rxjs';
import { EmpresaService } from '../empresas/service/empresa.service';
import * as Papa from 'papaparse';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css'],
  providers: [MessageService, Utils]
})
export class ProdutosComponent implements OnInit, OnDestroy {

  produtoDialog: boolean = false;

  tituloTela: String = 'Meus Produtos';

  filteredProdutos: Produto[] = [];

  filteredProdutosAdvanced: Produto[] = [];

  selectedProdutosAdvanced: Produto[] = [];

  selectedProdutos: Produto[] = [];

  empresas: any[] = [];
  empresaSelecionada: any = null;

  sortOrder: number = 0;

  sortField: string = '';

  sourceCities: any[] = [];

  targetCities: any[] = [];

  orderCities: any[] = [];

  submitted: boolean = false;
  deleteProdutosDialog: boolean = false;
  ProdutosDialog: boolean = false;

  Produtos: Produto = {};

  produtoEdit: Produto = {};

  listProdutos: Produto[] = [];
  cols: any[] = [];

   /*
   * Paginator config
   */
   page: number = 1;
   pageSize: number = 15;
   totalProdutos: number = 0;
   totalPaginas: number = 0;

   rowsPerPageOptions = [5, 10, 20];
   loading: boolean = true;
   globalFilterValue: String = '';

  constructor(
    private produtoService: ProdutoService,
    private empresaService: EmpresaService,
    private messageService: MessageService,
    private loginService: LoginService,
    private router: Router,
    private autoRefreshService: AutoRefreshService
  ) {}

  ngOnDestroy(): void {}


  ngOnInit(): void {
    this.loading = false;
    this.carregarEmpresas();
  }

  carregarEmpresas(): void {
    this.empresaService.findAll().subscribe(
      (dados) => {
        this.empresas = dados;
      },
      (erro) => {
        console.error('Erro ao carregar empresas:', erro);
      }
    );
  }

  onEmpresaChange(event: any): void {
    if (this.empresaSelecionada) {
      this.loadLazyProduto({ first: 0, rows: this.pageSize }); // Recarrega os produtos com a empresa selecionada
    } else {
      this.listProdutos = []; // Limpa os produtos exibidos
      this.totalProdutos = 0;
    }
  }

  openNewProduto() {
    this.produtoEdit = {};
    this.produtoEdit.empresa = this.empresaSelecionada;
    this.produtoDialog = true;
  }

  editProduto(row: Produto) {
    this.produtoEdit = { ...row };
    this.produtoEdit.empresa = this.empresaSelecionada;
    this.produtoDialog = true;
  }

  deleteProduto(row: Produto) {
    const observer: Observer<any> = {
      next: (response) => {
        this.produtoEdit = {};
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

    row.empresa = this.empresaSelecionada;
    this.produtoService.remove(row).subscribe(observer);
  }

  saveProduto() {
    const observer: Observer<any> = {
      next: (response) => {
        this.produtoDialog = false;
        this.produtoEdit = {};
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

    this.produtoService.save(this.produtoEdit).subscribe(observer);
  }
  refresh() {
    this.loadLazyProduto({ first: 0, rows: this.pageSize });
  }

  hideDialog() {
    this.produtoDialog = false;
  }

  loadLazyProduto(event: TableLazyLoadEvent) {

    if (!this.empresaSelecionada) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione uma empresa para carregar os produtos.',
        life: 3000,
      });
      this.listProdutos = [];
      this.totalProdutos = 0;
      return;
    }

    const first = event.first || 0;
    this.page = first / this.pageSize + 1;
    this.pageSize = event.rows || 15;
    const filterValue = this.globalFilterValue;

    const observer: Observer<any> = {
      next: (response) => {

        this.listProdutos = response.content;
        this.totalProdutos = response.totalElements;
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

    this.produtoService
      .findPaginate(this.page, this.pageSize, filterValue, this.empresaSelecionada.id)
      .subscribe(observer);

  }

  onFilter(dv: Table, event: Event) {
    this.globalFilterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.loadLazyProduto({first: 0, rows: this.pageSize});
  }

  listProdutoss: Produto[] = [];

  onFileSelect(event: any) {
    const file = event.files[0];

    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const reader = new FileReader();

        reader.onload = () => {
          const csvData = reader.result as string;
          this.parseCSV(csvData);
        };

        reader.onerror = () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao ler o arquivo CSV.',
            life: 3000,
          });
        };

        reader.readAsText(file);
        event.files = [];
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Arquivo inválido',
          detail: 'Por favor, selecione um arquivo CSV válido.',
          life: 3000,
        });
        event.files = [];
      }
    }
  }

  parseCSV(csvData: string) {
    Papa.parse(csvData, {
      header: true, // Assume que a primeira linha do CSV contém os cabeçalhos
      dynamicTyping: true, // Converte automaticamente os valores para o tipo correto (número, booleano, etc)
      skipEmptyLines: true, // Ignora linhas em branco
      complete: (result) => {
        this.listProdutoss = result.data.map((item: any) => ({
          codBarras: item.codBarras,
          nomeProduto: item.nomeProduto,
          descricao: item.descricao,
          marca: item.marca,
          preco: item.preco.replace(',','.'),
        })) as Produto[]; // Atribui os dados ao array
        this.saveAllProdutos(); // Salva os produtos no backend
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro no CSV',
          detail: `Falha ao processar o arquivo CSV: ${error.message}`,
          life: 3000,
        });
      },
    });
  }

  saveAllProdutos() {
    this.listProdutoss.forEach((produto) => {

      const produtoComEmpresa = {
        ...produto,
        empresa: this.empresaSelecionada,
      };

      this.produtoService.save(produtoComEmpresa).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Produto "${produtoComEmpresa.nomeProduto}" salvo com sucesso!`,
            life: 3000,
          });
          this.refresh();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: `Erro ${err.status}`,
            detail: `Falha ao salvar "${produtoComEmpresa.nomeProduto}": ${err.statusText}`,
            life: 3000,
          });
          console.error('Erro ao salvar produto:', err);
        },
      });
    });
  }

}
