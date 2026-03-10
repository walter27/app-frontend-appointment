import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { StoreService } from '../../store/store';
import { AppointmentService } from '../../services/appointment-service';
import { Modal } from '../../../components/modal/modal';
import { AppointmentDto, FieldConfig, ShiftAssignedDto } from '../../models';
import { Form } from '../../../components/form/form';
import { Loading } from '../../../components/loading/loading';
import { Success } from '../../../components/success/success';
import { Error } from '../../../components/error/error';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule, FullCalendarModule, Modal, Error, Success, Form, Loading],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'

})
export class Calendar {

  @ViewChild(Form) formComponent?: Form;
  @ViewChild(FullCalendarComponent) fullCalendar!: FullCalendarComponent;
  @ViewChild(FullCalendarComponent, { read: ElementRef }) fullCalendarHost!: ElementRef<HTMLElement>;
  private storeService = inject(StoreService);
  private appointmentService = inject(AppointmentService)
  openModal = this.storeService.openModal
  events = this.storeService.events
  fullCalendarSignal = this.storeService.fullCalendar;
  loading = this.storeService.loading
  error = this.storeService.error;
  success = this.storeService.success

  calendarOptions: CalendarOptions = {
    initialView: this.getResponsiveView(),
    plugins: [dayGridPlugin, timeGridPlugin],
    firstDay: 0,
    allDaySlot: false,
    nowIndicator: true,
    slotMinTime: '08:00:00',
    slotMaxTime: '17:00:00',
    slotDuration: '00:30:00',
    expandRows: true,
    eventDisplay: 'block',
    eventBackgroundColor: '#0ea5e9',
    eventBorderColor: '#0ea5e9',
    eventTextColor: '#ffffff',
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
    },
    eventsSet: () => {
      this.updateEmptyDayColumns();
      if (!this.storeService.changeFromDatePicker() && this.storeService.fullCalendar()) {
        this.storeService.setSelectedDate(this.storeService.fullCalendar()!.getDate())
      }
      this.updateToolbarTitle();
    },
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'today prev,next'
    },
    buttonText: {
      today: 'Today',
    },
    dayHeaderFormat: {
      weekday: 'short',
      day: 'numeric'
    },
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
    },
    eventClick: (arg: EventClickArg) => {
      const shifAssignedDto: ShiftAssignedDto = {
        id: null,
        dateRegister: this.getLocalDateTime(),
        employeeId: null,
        customerId: null,
        appointmentId: Number(arg.event.id),
        attached: null
      }
      this.storeService.setLoadingAndSuccesAndError(false, false, false)
      this.storeService.setOpenModal(true);
      this.storeService.setObject(shifAssignedDto, 'shiftAssigned')
    },
  };

  fields: FieldConfig[] = [
    {
      name: 'id',
      label: 'Id',
      step: 1,
      row: 1,
      column: 1,
      type: 'text',
      validators: []
    },
    {
      name: 'name',
      label: 'Name',
      step: 1,
      row: 2,
      column: 1,
      type: 'text',
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)]
    },
    {
      name: 'last_name',
      label: 'Last name',
      step: 1,
      row: 3,
      column: 1,
      type: 'text',
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)]
    },
    {
      name: 'email',
      label: 'Email',
      step: 1,
      row: 4,
      column: 1,
      type: 'email',
      validators: [Validators.required, Validators.email]
    },
    {
      name: 'phone',
      label: 'Phone',
      step: 1,
      row: 5,
      column: 1,
      type: 'text',
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(20)]
    },
    {
      name: 'ventity_type_id',
      label: 'Entity',
      type: 'select',
      step: 1,
      row: 7,
      column: 1,
      options: [
        { label: 'Natural Person', value: '1' },
        { label: 'Legal Entity', value: '2' }
      ],
      validators: [Validators.required]
    },
    {
      name: 'attached',
      label: 'File',
      step: 1,
      row: 6,
      column: 1,
      type: 'file',
      accept: '.pdf,.png,.jpg,.jpeg',
      validators: [Validators.required]
    }
  ]


  constructor() {
    effect(() => {
      const api = this.fullCalendarSignal();
      const nextEvents = this.events();
      if (!api) return;

      api.removeAllEventSources();
      api.addEventSource(nextEvents);
      this.storeService.setChangeFromDatePicker(false)
    });
  }

  ngAfterViewInit() {
    const calendarApi = this.fullCalendar.getApi();
    this.storeService.setFullCalendar(calendarApi);
    this.applyResponsiveCalendarView();
    this.updateToolbarTitle();
  }

  ngOnInit(): void {
    this.appointmentService.getAppointments('2026-02-01', '2026-03-31');
    this.storeService.setFields(this.fields)
  }


  private updateEmptyDayColumns(): void {
    const calendarApi = this.fullCalendar?.getApi();
    if (!calendarApi) {
      return;
    }

    const host = this.fullCalendarHost.nativeElement;
    const dayColumns = host.querySelectorAll<HTMLElement>('.fc-timegrid-col[data-date]');
    dayColumns.forEach((column) => column.classList.remove('fc-day-empty'));

    const events = calendarApi.getEvents();
    const view = calendarApi.view;
    const start = new Date(view.activeStart);
    const end = new Date(view.activeEnd);

    for (let cursor = new Date(start); cursor < end; cursor.setDate(cursor.getDate() + 1)) {
      const dateKey = this.toDateKey(cursor);
      const hasEvents = events.some((event) => event.start && this.toDateKey(event.start) === dateKey);

      if (!hasEvents) {
        const column = host.querySelector<HTMLElement>(`.fc-timegrid-col[data-date="${dateKey}"]`);
        column?.classList.add('fc-day-empty');
      }
    }
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.applyResponsiveCalendarView();
  }

  private getResponsiveView(): 'timeGridDay' | 'timeGridWeek' {
    if (typeof window === 'undefined') {
      return 'timeGridWeek';
    }
    return window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek';
  }

  private applyResponsiveCalendarView(): void {
    const calendarApi = this.fullCalendar?.getApi();
    if (!calendarApi) return;

    const targetView = this.getResponsiveView();
    if (calendarApi.view.type !== targetView) {
      const anchorDate = this.storeService.selectedDate() ?? calendarApi.getDate();
      calendarApi.changeView(targetView, anchorDate);
    }
  }


  private updateToolbarTitle(): void {
    const calendarApi = this.fullCalendar?.getApi();
    if (!calendarApi) {
      return;
    }

    const currentDate = calendarApi.getDate();
    const title = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(currentDate);

    const titleElement = this.fullCalendarHost?.nativeElement.querySelector<HTMLElement>('.fc-toolbar-title');
    if (!titleElement) {
      return;
    }

    titleElement.textContent = title;
  }


  onModalSave(): void {
    if (this.error() || this.success()) {
      this.storeService.setOpenModal(false)
      return
    }
    const isFormValid = this.formComponent?.submitFromModalAction();
    if (!isFormValid || !this.formComponent) {
      return;
    }

    const attached = this.formComponent.form.get('attached')?.value as File | File[] | null;
    const currentShiftAssigned = this.storeService.shiftAssignedDto();
    if (currentShiftAssigned) {
      const selectedFile = Array.isArray(attached) ? (attached[0] ?? null) : (attached ?? null);
      this.storeService.setObject({
        ...currentShiftAssigned,
        attached: selectedFile
      }, 'shiftAssigned');
    }

    this.appointmentService.saveCustomer()
  }

  getLocalDateTime(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('.')[0];
  }
}
