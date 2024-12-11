import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../infra/service/auth-guard.service';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'produtos', loadChildren: () =>import('./produtos/produtos.module').then((m) => m.ProdutosModule), canActivate: [AuthGuard] },
      { path: 'empresas', loadChildren: () =>import('./empresas/empresas.module').then((m) => m.EmpresasModule), canActivate: [AuthGuard] },
      { path: '**', redirectTo: 'produtos'}
    ]),
  ],
  exports: [RouterModule],
})
export class ComponentsRoutingModule {}
