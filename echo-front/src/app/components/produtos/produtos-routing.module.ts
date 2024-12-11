import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProdutosComponent } from './produtos.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ProdutosComponent }
	])],
	exports: [RouterModule]
})
export class ProdutosRoutingModule { }
