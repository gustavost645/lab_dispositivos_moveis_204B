import { Component, OnInit } from '@angular/core';
import { LoginService } from './service/login.service';
import { Observer } from 'rxjs';
import { Router } from '@angular/router';
import { Message } from 'primeng/api';
import { LayoutService } from '../../layout/service/app.layout.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [],
})
export class LoginComponent implements OnInit {
  login!: string;
  password!: string;
  loading: boolean = false; // Variável para controlar a exibição do ícone de carga

  valCheck: string[] = ['remember'];
  msgs: Message[] = [];

  constructor(
    public layoutService: LayoutService,
    private service: LoginService,
    private router: Router
  ) {}

  ngOnInit() {}

  singin() {
    if (!this.login || !this.password || this.loading) {
      return;
    }

    this.loading = true;

    const observer: Observer<any> = {
      next: (res) => {
        if (res && res.token) {
          this.router.navigate(['/app/pedidos']);
        } else {
          this.msgs = [
            {
              severity: 'error',
              summary: 'Erro',
              detail: 'Credenciais inválidas.',
            },
          ];
        }
      },
      error: (err) => {
        this.loading = false;
        this.msgs = [
          {
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao fazer login.',
          },
        ];
      },
      complete: () => {
        this.loading = false;
      },
    };

    this.service.login(this.login, this.password).subscribe(observer);
  }

  loginWithGoogle() {
    this.loading = true; // Define loading como true para exibir o ícone de carga

    this.service.loginWithGoogle()
      .then(user => {
        console.log('Usuário autenticado:', user);
        this.router.navigate(['/app/pedidos']); // Redireciona após o login
      })
      .catch(error => {
        this.loading = false; // Oculta o ícone de carga em caso de erro
        this.msgs = [
          {
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao fazer login com Google: ' + error.message,
          },
        ];
      });
  }
}
