import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.css'],
})
export class ImageUploaderComponent {
  constructor() {}

  @ViewChild('fileInput') fileInput!: ElementRef;

  @Input() imageData: string | null = null;
  @Input() renderButtonRemove: boolean | false = false;

  @Output() imageSelected = new EventEmitter<string>();
  @Output() imageDataChange = new EventEmitter<string | null>();


  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0]; // Verifica a existência de event.dataTransfer
    if (file) {
      this.processImage(file);
    }
  }


  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.processImage(inputElement.files[0]);
    }
  }

  processImage(file: File): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageData = (reader.result as string).replace(/^data:image\/[^;]+;base64,/, '');
        this.imageSelected.emit(this.imageData); // Emitir o evento com os dados da imagem
      };
      reader.readAsDataURL(file);
    } else {
      console.error('O arquivo selecionado não é uma imagem.');
    }
  }

  removeImage(): void {
    this.imageData = null;
    this.imageDataChange.emit(null);
    this.imageSelected.emit();
  }

  openFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onImageSelected(imagem: string) {
    this.imageData = imagem;
    this.imageDataChange.emit(this.imageData);
  }

}
