

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
    path?: { lat: number, lng: number }[];
    geometry?: any; // To store the full GeoJSON geometry from the directions API
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
export type FuelType = 'Diesel' | 'Gasoline';

export type FuelLogEntry = {
    id: string;
    date: string;
    liters: number;
    cost: number;
    odometer: number;
    fuelType: FuelType;
};

export type MaintenanceLogEntry = {
    id: string;
    date: string;
    description: string;
    cost: number;
    odometer: number;
};

export type Vehicle = {
    id: string;
    type: string;
    fuelType: FuelType;
    capacity: number; // in kg
    licensePlate: string;
    status: VehicleStatus;
    nextMaintenance: string;
    odometer: number;
    lastServiceDate: string;
    lastDriverId: string | null;
    fuelLog?: FuelLogEntry[];
    maintenanceLog?: MaintenanceLogEntry[];
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

export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'Client Payment' | 'Fuel' | 'Salaries' | 'Maintenance' | 'Other';

export type Transaction = {
    id: string;
    date: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    description: string;
};
