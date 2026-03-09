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
    type_document_id: number,
    entity_type_id: number
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
    dateRegister: string;
    customerId: number | null;
    employeeId: number | null;
    appointmentId: number | null;
    attached?: File | null;
    filePath?: string | null;
}
