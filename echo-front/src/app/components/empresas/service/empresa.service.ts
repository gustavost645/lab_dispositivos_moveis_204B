import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Empresa } from '../model/empresa';
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {

  private readonly API = environment.apiUrl +'api/empresas';

  private _Empresa: Empresa[] = [];

  private EmpresaSubject: BehaviorSubject<Empresa[]> = new BehaviorSubject(this._Empresa);

  get Empresa$(): Observable<Empresa[]> {
    return this.EmpresaSubject.asObservable();
  }

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<any> {
    return this.httpClient.get<Empresa[]>(this.API);
  }

  findAllByUsuario(idUsuario: number): Observable<any> {
    return this.httpClient.get<Empresa[]>(this.API);
  }

  findById(id: string): Observable<any> {
    return this.httpClient.get<Empresa>(`${this.API}/${id}`);
  }

  findPaginate(page: number, pageSize: number, filterValue: String): Observable<any> {
    return this.httpClient.get<Empresa[]>(`${this.API}/listEmpresas?page=${page}&pageSize=${pageSize}&filterValue=${filterValue}`);
  }

  save(record: any): Observable<any> {
    if (record.id) {
      return this.update(record);
    }
    return this.create(record);
  }

  private create(data: any): Observable<any> {
    return this.httpClient.post<Empresa>(this.API, data);
  }

  private update(data: any): Observable<any> {
    return this.httpClient.post<Empresa>(this.API, data);
  }

  remove(id: string): Observable<any> {
    return this.httpClient.delete(`${this.API}/${id}`);
  }

  // Adicione este método para atualizar a lista de Produto
  atualizarProduto(novosProduto: Empresa[]) {
    this._Empresa = novosProduto;
    this.EmpresaSubject.next(this._Empresa);
  }

}
