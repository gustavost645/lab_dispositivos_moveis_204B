import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Produto } from '../model/produto';
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {

  private readonly API = environment.apiUrl +'api/produtos';

  private _Produto: Produto[] = [];

  private ProdutoSubject: BehaviorSubject<Produto[]> = new BehaviorSubject(this._Produto);

  get Produto$(): Observable<Produto[]> {
    return this.ProdutoSubject.asObservable();
  }

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<any> {
    return this.httpClient.get<Produto[]>(this.API);
  }

  findAllByUsuario(idUsuario: number): Observable<any> {
    return this.httpClient.get<Produto[]>(this.API);
  }

  findById(id: string): Observable<any> {
    return this.httpClient.get<Produto>(`${this.API}/${id}`);
  }

  findPaginate(page: number, pageSize: number, filterValue: String, empresaSelecionada: String): Observable<any> {
    return this.httpClient.get<Produto[]>(`${this.API}/listProdutos?page=${page}&pageSize=${pageSize}&filterValue=${filterValue}&empresa=${empresaSelecionada}`);
  }

  save(record: any): Observable<any> {
    if (record.id) {
      return this.update(record);
    }
    return this.create(record);
  }

  private create(data: any): Observable<any> {
    return this.httpClient.post<Produto>(this.API, data);
  }

  private update(data: any): Observable<any> {
    return this.httpClient.post<Produto>(this.API, data);
  }

  remove(produto: any): Observable<any> {
    return this.httpClient.delete(`${this.API}/${produto.empresa.id}/${produto.id}`);
  }

  // Adicione este método para atualizar a lista de Produto
  atualizarProduto(novosProduto: Produto[]) {
    this._Produto = novosProduto;
    this.ProdutoSubject.next(this._Produto);
  }
}
