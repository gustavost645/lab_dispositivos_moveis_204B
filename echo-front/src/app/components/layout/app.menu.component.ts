import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
  model: any[] = [];

  constructor(public layoutService: LayoutService) {}

  ngOnInit() {
    this.model = [
      {
        label: 'Cadastro',
        items: [

          {
            label: 'Empresas',
            icon: 'pi pi-fw pi-clone',
            routerLink: ['empresas'],
          },
          {
            label: 'Produtos',
            icon: 'pi pi-fw pi-check-square',
            routerLink: ['produtos'],
          },
        ],
      },
    ];
  }
}
