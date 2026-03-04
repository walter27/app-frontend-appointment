import { AppointmentDto } from "../models";

export const eventAdapter = (response: AppointmentDto[]) => {
  return response
    .filter((appointmentDto) => appointmentDto.id !== null)
    .map((appointmentDto) => ({
      id: String(appointmentDto.id),
      title: appointmentDto.name,
      start: `${appointmentDto.date_appointment}T${appointmentDto.hour.start_time}`,
      end: `${appointmentDto.date_appointment}T${appointmentDto.hour.end_time}`,
      extendedProps: {
        hourId: appointmentDto.hour.id,
      },
    }));
};
