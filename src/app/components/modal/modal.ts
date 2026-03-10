import { Component, inject, output, signal } from '@angular/core';
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
  private closing = signal(false);
  private closeDurationMs = 180;

  isClosing(): boolean {
    return this.closing();
  }

  close(): void {
    if (this.closing()) {
      return;
    }

    this.closing.set(true);
    setTimeout(() => {
      this.storeService.setOpenModal(false);
      this.closing.set(false);
    }, this.closeDurationMs);
  }

  save(): void {
    this.saved.emit();
  }
}
