export interface DayDto {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    time_hours: TimeDto[]
}

export interface TimeDto {
    id: number;
    start_time: string
    end_time: string
}

export interface CustomerDto {
    id: number | null,
    dni: string,
    name: string,
    last_name: string,
    email: string,
    phone: string,
    type_document_id: 1
}

export interface AppointmentDto {
    id: number | null,
    name: string,
    date_appointment: string,
    date_register: string,
    avaible: 3,
    hour: TimeDto
}
export interface ShiftAssignedDto {
    id: number | null
    date_register: string;
    customer_id: number | null;
    employee_id: number | null;
    appointment_id: number | null;
}
