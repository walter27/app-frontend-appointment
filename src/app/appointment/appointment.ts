import { Component, inject, OnInit } from '@angular/core';
import { Calendar } from './components/calendar/calendar';
import { AppointmentService } from './services/appointment-service';

@Component({
  selector: 'app-appointment',
  imports: [Calendar],
  templateUrl: './appointment.html',
  styleUrl: './appointment.css'
})
export class Appointment {
  
}
