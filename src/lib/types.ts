

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

export type RoutePoint = {
  id: string;
  type: 'client' | 'unassociated';
  coordinates: { lat: number; lng: number };
  clientId?: string | null; // Associated client ID if type is 'client'
  order: number; // Position in route sequence
  estimatedTime?: number; // Estimated collection time in minutes
  notes?: string;
};

export type CollectionTime = {
  id: string;
  time: string; // HH:mm format
  estimatedDuration: number; // in minutes
};

export type Route = {
  id: string;
  name: string;
  color: string; // Hex color for route visualization
  weekdays: DayOfWeek[];
  collectionTimes: CollectionTime[];
  points: RoutePoint[];
  totalDistance?: number; // in kilometers
  estimatedDuration?: number; // in minutes
  isActive: boolean;
  providerId: string;
  createdAt?: any;
  updatedAt?: any;
  // New routing fields for street-based routing (flattened for Firestore compatibility)
  routingData?: {
    // Store coordinates as flat arrays to avoid nested arrays
    segmentCoordinates: string[]; // JSON stringified array of coordinate arrays
    segmentDistances: number[]; // Array of distances in meters
    segmentDurations: number[]; // Array of durations in seconds
    totalDistance: number; // in meters
    totalDuration: number; // in seconds
    lastCalculated: any; // Timestamp
  };
};

export interface Provider {
  id: string;
  name: string;
  phone: string; // Required phone number for M-Pesa/e-Mola integration
  email?: string | null;
  address?: string | null;
  businessType?: string | null;
  subscriptionStatus: 'trial' | 'active' | 'expired';
  subscriptionEndDate?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export interface Client {
  id: string;
  name: string;
  phone: string; // Required phone number for M-Pesa/e-Mola integration and sync
  address?: string | null; // Made optional as per requirements
  email?: string | null;
  coordinates?: { lat: number; lng: number }; // Made optional for local management
  collectionStatus: CollectionStatus;
  paymentStatus: PaymentStatus;
  garbageStatus: GarbageStatus;
  nextCollectionDate?: any | null; // Firestore Timestamp or null
  nextPaymentDueDate?: any | null; // Firestore Timestamp or null
  paymentHistory: Payment[];
  balance: number;
  sharesLocation: boolean;
  routeId: string | null;
  providerId: string;
  userId: string | null; // ID of the user with 'client' role - null means unlinked
  createdAt?: any;
  updatedAt?: any;
}

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
