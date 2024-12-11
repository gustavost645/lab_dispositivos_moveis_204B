import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserModel } from './../model/user.model';
import { Usuario } from '../model/usuario.model';
import { initializeApp } from 'firebase/app';
import { Auth, getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, User, UserCredential } from 'firebase/auth';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  private readonly API = environment.apiUrl + 'api/auth/login';
  private readonly API_LOGIN = environment.apiUrl + 'api/auth/new_login';
  private readonly TOKEN_KEY = 'auth_token';
  private user: UserModel | null = null;

  private app = initializeApp(environment.firebase);
  private auth: Auth = getAuth(this.app);

  constructor(private httpClient: HttpClient, private router: Router) {}

  login(userlogin: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return new Observable<any>((observer) => {
      signInWithEmailAndPassword(this.auth, userlogin, password)
        .then((userCredential: UserCredential) => {
          const user = userCredential.user;

          user.getIdToken().then((idToken: string) => {
            this.httpClient.post<any>(this.API_LOGIN, { idToken }, { headers: headers }).pipe(
              map((response) => {
                // Se a resposta for um objeto JSON, tudo bem, continue como antes
                if (response && response.token) {
                  localStorage.setItem(this.TOKEN_KEY, response.token);
                  const { id, nome, login } = response;
                  this.setUser({ id, username: nome, login });
                }
                observer.next(response);
                observer.complete();
              }),
              catchError((error) => {
                localStorage.removeItem(this.TOKEN_KEY);
                localStorage.removeItem('userData');
                console.error('Erro ao tentar fazer login:', error);

                // Caso a resposta seja uma string
                if (typeof error.error.text === 'string') {
                  // Aqui você pode processar a string de resposta de forma personalizada
                  console.log('Texto retornado do backend:', error.error.text);
                }

                // Retorna um erro legível
                return throwError(() => new Error('Falha na autenticação: ' + error.message));
              })
            ).subscribe();
          });
        })
        .catch((error) => {
          console.error('Falha ao fazer login:', error);
          observer.error('Falha na autenticação: ' + error.message);
        });
    });
}


  loginWithGoogle(): Promise<any> {
    const provider = new GoogleAuthProvider();
    let token = "";
    let user: User;

    return signInWithPopup(this.auth, provider)
      .then(async (result) => {
        user = result.user;

        // Verifique se o usuário está autenticado
        if (!user) throw new Error('Usuário não autenticado');

        // Obtém o token inicial
        token = await user.getIdToken();

        const maxRetries = 2;
        let attempt = 0;

        const sendRequestWithToken = async (token: string): Promise<any> => {
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          });

          try {
            return await this.httpClient.post<any>(this.API, {}, { headers: headers }).toPromise();
          } catch (error: any) {
            if (error.status === 401 && error.error === "Token expired. Please refresh and try again.") {
              localStorage.removeItem(this.TOKEN_KEY);
              if (attempt < maxRetries) {
                attempt++;
                token = await user.getIdToken(true);
                return sendRequestWithToken(token);
              } else {
                throw new Error('Token expirado e não pôde ser renovado após várias tentativas.');
              }
            } else {
              throw error;
            }
          }
        };

        // Tenta enviar a requisição com o token inicial
        return sendRequestWithToken(token);
      })
      .then((response) => {
        if (response) {
          // Armazena o token no localStorage após login bem-sucedido
          localStorage.setItem(this.TOKEN_KEY, token);
          const { uid, displayName, email } = user;
          this.setUser({ id: Number(uid), username: displayName ?? 'User', login: email ?? 'User' });
        }
        return response;
      })
      .catch((error) => {
        console.error('Erro ao fazer login com Google:', error);
        throw error;
      });
  }



  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const verif = (token !== null && !this.isTokenExpired(token));
    if (verif == false) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem('userData');
    }

    return verif;
  }

  private isTokenExpired(token: string): boolean {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return true; // Token JWT malformatado
    }

    const payload = JSON.parse(atob(tokenParts[1])); // Decodifique a parte do payload em Base64
    const currentTime = Math.floor(Date.now() / 1000); // em segundos
    return payload.exp < currentTime;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('userData');
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token == null) {
      this.router.navigate(['/']);
    }
  }

  setUser(user: UserModel) {
    localStorage.setItem('userData', JSON.stringify(user));
    this.user = user;
  }

  getUser() {
    const savedUserJson = localStorage.getItem('userData');
    if (savedUserJson) {
      this.user = JSON.parse(savedUserJson);
    }
    return this.user;
  }

  getUserSessionView(): Usuario {
    const userModel = this.getUser() as UserModel;
    const usuario: Usuario = {
      id: typeof userModel.id === 'string' ? Number(userModel.id) : userModel.id,
      nome: userModel.username,
    };
    return usuario;
  }
}

