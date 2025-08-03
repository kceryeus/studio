export type CollectionStatus = 'active' | 'suspended';
export type PaymentStatus = 'paid' | 'due' | 'overdue';
export type GarbageStatus = 'collected' | 'pending' | 'missed' | 'out' | 'not-out';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';


export type Payment = {
  id: string;
  date: string;
  amount: number;
  status: 'paid';
};

export type Route = {
    id: string;
    name: string;
    weekdays: DayOfWeek[];
};

export type Client = {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  collectionStatus: CollectionStatus;
  paymentStatus: PaymentStatus;
  garbageStatus: GarbageStatus;
  nextCollectionDate: string;
  nextPaymentDueDate: string;
  paymentHistory: Payment[];
  balance: number;
  sharesLocation: boolean;
  routeId: string | null;
};

export type VehicleStatus = 'in-use' | 'maintenance' | 'available';

export type Vehicle = {
    id: string;
    type: string;
    fuelType: 'Diesel' | 'Gasoline' | 'Electric';
    capacity: number; // in kg
    licensePlate: string;
    status: VehicleStatus;
    nextMaintenance: string;
};

export type WorkerStatus = 'working' | 'on-leave';
export type EmploymentType = 'permanent' | 'occasional';

export type TimesheetEntry = {
    date: string;
    checkIn: string;
    checkOut: string;
    totalHours: number;
};

export type Worker = {
    id: string;
    name: string;
    role: 'Driver' | 'Picker' | 'Supervisor';
    employmentType: EmploymentType;
    wage: number; // per hour
    status: WorkerStatus;
    assignedVehicleId: string | null;
    lastCheckIn: string | null;
    imageUrl?: string;
    timesheet?: TimesheetEntry[];
};

export type AssignmentStatus = 'active' | 'completed';

export type Assignment = {
    id: string;
    workerId: string;
    vehicleId: string;
    date: string;
    taskDescription: string;
    status: AssignmentStatus;
};
