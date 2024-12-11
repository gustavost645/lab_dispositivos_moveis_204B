import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FabButtonComponent } from './fab-button.component';


@NgModule({
  declarations: [FabButtonComponent],
  imports: [
    CommonModule,
    ButtonModule
  ],
  exports: [FabButtonComponent],
})
export class FabButtonModule { }
