
export enum AppointmentStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Denied = 'denied',
}

export interface AppointmentSlot {
  id: string;
  dateTime: Date;
  status: AppointmentStatus;
  serviceType: string;
  numberOfPets: number;
  serviceDuration: number; // in minutes. 0 for services where it's not applicable (e.g., Overnight)
  price: number;
}

export interface AppointmentRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  slots: AppointmentSlot[];
  submittedAt: Date;
}

export type View = 'customer' | 'admin';
