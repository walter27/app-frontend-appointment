import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AppointmentDto, CustomerDto, DayDto, ShiftAssignedDto } from '../models';
import { StoreService } from '../store/store';
import { eventAdapter } from '../adapters/appointment-adapter';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {

  private baseUrl: string = environment.baseUrl
  private http = inject(HttpClient)
  private storeService = inject(StoreService);


  saveCustomer(): void {
    const customer = this.storeService.customerDto()
    this.storeService.setLoadingAndSuccesAndError(true, false, false)
    this.http.post<CustomerDto>(`${this.baseUrl}/customers`, customer)
      .subscribe((response) => {
        this.storeService.setObject(response, 'customer')
        this.saveShiftAssigned()
      })
  }

  getAppointments(start?: string, end?: string): void {
    const params = this.buildAppointmentRangeParams(start, end);
    this.http.get<AppointmentDto[]>(`${this.baseUrl}/appointments`, { params }).subscribe((response) => {
      this.storeService.setEvents(eventAdapter(response))
    })
  }

  saveShiftAssigned() {
    const base = this.storeService.shiftAssignedDto();
    const customerId = this.storeService.customerDto()?.id ?? null;
    if (!base) return;
    const shiftAssignedDto: ShiftAssignedDto = {
      id: null,
      date_register: base.date_register ?? '',
      customer_id: customerId,
      employee_id: null,
      appointment_id: base.appointment_id
    };
    this.http.post<ShiftAssignedDto>(`${this.baseUrl}/shift-assigned`, shiftAssignedDto)
      .subscribe((response) => {
        this.storeService.setLoadingAndSuccesAndError(false, true, false)
        this.getAppointments()
      }, (err) => {
        this.storeService.setLoadingAndSuccesAndError(false, false, true)
      },)
  }

  errorHandler(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  private buildAppointmentRangeParams(start?: string, end?: string): HttpParams {
    if (start && end) {
      return new HttpParams().set('start', start).set('end', end);
    }

    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    return new HttpParams()
      .set('start', this.formatDateYmd(firstDayCurrentMonth))
      .set('end', this.formatDateYmd(lastDayNextMonth));
  }

  private formatDateYmd(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

}
