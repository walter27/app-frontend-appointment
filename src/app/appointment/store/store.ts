import { computed, Injectable, signal } from '@angular/core';
import { CalendarApi } from '@fullcalendar/core';
import { AppointmentDto, CustomerDto, Event, FieldConfig, ShiftAssignedDto } from '../models';

type Store = {
  selectedDate: Date | null;
  changeFromDatePicker: boolean;
  fullCalendar: CalendarApi | null
  events: Event[]
  openModal: boolean
  fields: FieldConfig[]
  customerDto: CustomerDto | null
  shiftAssignedDto: ShiftAssignedDto | null
  loading: boolean
  success: boolean
  error: boolean
}

const initialStore: Store = {
  selectedDate: new Date(),
  changeFromDatePicker: false,
  fullCalendar: null,
  events: [],
  openModal: false,
  fields: [],
  customerDto: null,
  shiftAssignedDto: null,
  loading: false,
  success: false,
  error: false,

}

@Injectable({
  providedIn: 'root',
})
export class StoreService {

  private readonly state = signal<Store>(initialStore);
  readonly selectedDate = computed(() => this.state().selectedDate)
  readonly changeFromDatePicker = computed(() => this.state().changeFromDatePicker)
  readonly fullCalendar = computed(() => this.state().fullCalendar)
  readonly events = computed(() => this.state().events)
  readonly openModal = computed(() => this.state().openModal)
  readonly fields = computed(() => this.state().fields)
  readonly customerDto = computed(() => this.state().customerDto)
  readonly shiftAssignedDto = computed(() => this.state().shiftAssignedDto)
  readonly loading = computed(() => this.state().loading)
  readonly success = computed(() => this.state().success)
  readonly error = computed(() => this.state().error)


  setSelectedDate(selectedDate: Date | null): void {
    this.state.update((s) => ({ ...s, selectedDate }));
  }

  setChangeFromDatePicker(changeFromDatePicker: boolean): void {
    this.state.update((s) => ({ ...s, changeFromDatePicker }));
  }

  setFullCalendar(fullCalendar: CalendarApi) {
    this.state.update((s) => ({ ...s, fullCalendar }))
  }

  setEvents(events: Event[]) {
    this.state.update((s) => ({ ...s, events }))
  }

  setOpenModal(openModal: boolean) {
    this.state.update((s) => ({ ...s, openModal }))
  }

  setFields(fields: FieldConfig[]) {
    this.state.update((s) => ({ ...s, fields }))
  }

  setObject(form: any, type: string) {
    if (type === 'customer') {
      this.state.update((s) => ({ ...s, customerDto: { ...form } }))
    }
    if (type === 'shiftAssigned') {
      this.state.update((s) => ({ ...s, shiftAssignedDto: { ...form } }))
    }
  }

  setLoadingAndSuccesAndError(loading: boolean, success: boolean, error: boolean) {
    this.state.update((s) => ({ ...s, loading, success, error }))
  }

  reset(): void {
    this.state.set(initialStore);
  }




}
