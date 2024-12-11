import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploaderComponent } from './image-uploader.component';
import { ButtonModule } from 'primeng/button';


@NgModule({
  imports: [
    CommonModule,
    ButtonModule
  ],
  declarations: [ImageUploaderComponent],
  exports:[ImageUploaderComponent]
})
export class ImageUploaderModule { }
