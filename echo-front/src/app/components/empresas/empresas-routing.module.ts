
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmpresasComponent } from './empresas.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: EmpresasComponent }
	])],
	exports: [RouterModule]
})
export class EmpresasRoutingModule { }
