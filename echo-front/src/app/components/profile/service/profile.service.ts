import { Profile } from '../model/profile';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly API = environment.apiUrl + 'api/profile';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<any> {
    return this.httpClient.get<Profile[]>(this.API);
  }

  findById(id: string): Observable<any> {
    return this.httpClient.get<Profile>(`${this.API}/${id}`);
  }

  save(record: any): Observable<any> {
    if (record.id) {
      return this.update(record);
    }
    return this.create(record);
  }

  private create(data: any): Observable<any> {
    return this.httpClient.post<Profile>(this.API, data);
  }

  private update(data: any): Observable<any> {
    return this.httpClient.post<Profile>(this.API, data);
  }

  remove(id: string): Observable<any> {
    return this.httpClient.delete(`${this.API}/${id}`);
  }
}
