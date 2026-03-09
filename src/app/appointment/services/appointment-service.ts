import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AppointmentDto, CustomerDto, ShiftAssignedDto } from '../models';
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
    if (!customer) return;

    const customerPayload: CustomerDto = {
      id: customer.id ?? null,
      dni: customer.dni ?? '',
      name: customer.name ?? '',
      last_name: customer.last_name ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      type_document_id: customer.type_document_id ?? null,
      entity_type_id: Number(customer.entity_type_id ?? 1)
    };

    this.storeService.setLoadingAndSuccesAndError(true, false, false)
    this.http.post<CustomerDto>(`${this.baseUrl}/customers`, customerPayload)
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
    if (!base || !customerId) return;

    const formData = new FormData();
    formData.append('customerId', String(customerId));
    formData.append('appointmentId', String(base.appointmentId ?? ''));
    formData.append('dateRegister', base.dateRegister ?? '');
    if (base.attached instanceof File) {
      formData.append('attached', base.attached, base.attached.name);
    }

    this.http.post<ShiftAssignedDto>(`${this.baseUrl}/shift-assigned`, formData)
      .subscribe((response) => {
        this.storeService.setLoadingAndSuccesAndError(false, true, false)
        this.getAppointments('2026-02-01', '2026-03-31')
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
