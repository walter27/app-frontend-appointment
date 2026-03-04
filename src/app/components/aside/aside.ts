import { Component, inject } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { StoreService } from '../../appointment/store/store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-aside',
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside {

  public isAdmin: boolean = true
  private storeService = inject(StoreService);
  selectedDate = this.storeService.selectedDate

  onDateSelect(date: Date | null): void {
    if (!date) return;
    this.storeService.setChangeFromDatePicker(true);
    const nextDate = new Date(date);
    this.storeService.setSelectedDate(nextDate);
    this.storeService.fullCalendar()?.gotoDate(nextDate);
  }

}
