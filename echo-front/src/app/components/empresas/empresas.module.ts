import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { RatingModule } from 'primeng/rating';
import { DataViewModule  } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DatePipe } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from "primeng/inputmask";
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { FabButtonModule } from '../fab-button/fab-button.module';
import { AutoCompleteModule } from "primeng/autocomplete";
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SkeletonModule } from 'primeng/skeleton';
import { ImageUploaderModule } from '../image-uploader/image-uploader.module';
import { TagModule } from 'primeng/tag';
import { EmpresasRoutingModule } from './empresas-routing.module';
import { EmpresasComponent } from './empresas.component';




@NgModule({
  imports: [
    CommonModule,
    EmpresasRoutingModule,
		FormsModule,
		InputTextModule,
		DropdownModule,
		RatingModule,
		ButtonModule,
    DataViewModule,
    OrderListModule,
    DatePipe,
    ToastModule,
    ToolbarModule,
    AvatarModule,
    DialogModule,
    FileUploadModule,
    InputTextareaModule,
    TableModule,
    RippleModule,
    RadioButtonModule,
    InputNumberModule,
    InputMaskModule,
    ChipModule,
    TooltipModule,
    FabButtonModule,
    AutoCompleteModule,
    ToggleButtonModule,
    SkeletonModule,
    ImageUploaderModule,
    TagModule
  ],
  declarations: [EmpresasComponent],
  exports: [EmpresasComponent]
})

export class EmpresasModule { }
