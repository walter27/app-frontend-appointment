import { Component, inject, input, output } from '@angular/core';
import { StoreService } from '../../appointment/store/store';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {

  saved = output<void>();
  private storeService = inject(StoreService);

  close(): void {
    this.storeService.setOpenModal(false)
  }

  save(): void {
    this.saved.emit();
  }
}
