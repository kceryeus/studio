
import type { Client, Route, DayOfWeek, Vehicle, Worker, TimesheetEntry, Assignment, Transaction, FuelLogEntry, MaintenanceLogEntry } from './types';

export const DUMMY_ROUTES: Route[] = [
    { 
        id: 'ROUTE01', 
        name: 'Rota do Centro da Cidade', 
        weekdays: ['Monday', 'Thursday'],
        path: [
            { lat: -25.9613, lng: 32.5895 },
            { lat: -25.9559, lng: 32.5727 }
        ]
    },
    { 
        id: 'ROUTE02', 
        name: 'Linha Suburbana', 
        weekdays: ['Tuesday', 'Friday'],
        path: [
            { lat: -25.9754, lng: 32.5768 },
            { lat: -25.9818, lng: 32.5940 }
        ]
    },
    { id: 'ROUTE03', name: 'Parque Industrial', weekdays: ['Wednesday'] },
];

export const DUMMY_CLIENTS: Client[] = [
  {
    id: 'CLI001',
    name: 'Julio Silva',
    address: 'Av. Julius Nyerere, 123, Maputo',
    coordinates: { lat: -25.9613, lng: 32.5895 },
    collectionStatus: 'active',
    paymentStatus: 'paid',
    garbageStatus: 'collected',
    nextCollectionDate: '2024-07-28',
    nextPaymentDueDate: '2024-08-16',
    balance: 0,
    paymentHistory: [
      { id: 'PAY001', date: '2024-06-22', amount: 1500, status: 'paid' },
      { id: 'PAY002', date: '2024-05-23', amount: 1500, status: 'paid' },
    ],
    sharesLocation: true,
    routeId: 'ROUTE01',
  },
  {
    id: 'CLI002',
    name: 'Mariana Costa',
    address: 'Rua de Bagamoyo, 456, Maputo',
    coordinates: { lat: -25.9559, lng: 32.5727 },
    collectionStatus: 'active',
    paymentStatus: 'due',
    garbageStatus: 'out',
    nextCollectionDate: '2024-07-24',
    nextPaymentDueDate: '2024-07-27',
    balance: 1500,
    paymentHistory: [
      { id: 'PAY003', date: '2024-06-17', amount: 1500, status: 'paid' },
    ],
    sharesLocation: true,
    routeId: 'ROUTE01',
  },
  {
    id: 'CLI003',
    name: 'Carlos Pereira',
    address: 'Av. 24 de Julho, 789, Maputo',
    coordinates: { lat: -25.9754, lng: 32.5768 },
    collectionStatus: 'active',
    paymentStatus: 'overdue',
    garbageStatus: 'pending',
    nextCollectionDate: '2024-07-24',
    nextPaymentDueDate: '2024-07-12',
    balance: 3000,
    paymentHistory: [],
    sharesLocation: true,
    routeId: 'ROUTE02',
  },
  {
    id: 'CLI004',
    name: 'Ana Rodrigues',
    address: 'Av. da Marginal, 1011, Maputo',
    coordinates: { lat: -25.9284, lng: 32.6186 },
    collectionStatus: 'suspended',
    paymentStatus: 'overdue',
    garbageStatus: 'missed',
    nextCollectionDate: 'N/A',
    nextPaymentDueDate: '2024-06-12',
    balance: 4500,
    paymentHistory: [],
    sharesLocation: true,
    routeId: 'ROUTE02',
  },
  {
    id: 'CLI005',
    name: 'Paulo Santos',
    address: 'Av. Vladimir Lenine, 212, Maputo',
    coordinates: { lat: -25.9682, lng: 32.5834 },
    collectionStatus: 'active',
    paymentStatus: 'paid',
    garbageStatus: 'not-out',
    nextCollectionDate: '2024-07-26',
    nextPaymentDueDate: '2024-08-11',
    balance: 0,
    paymentHistory: [
      { id: 'PAY004', date: '2024-06-24', amount: 1500, status: 'paid' },
    ],
    sharesLocation: true,
    routeId: 'ROUTE03',
  },
  {
    id: 'CLI006',
    name: 'Sofia Lopes',
    address: 'Rua da Argélia, 333, Maputo',
    coordinates: { lat: -25.9598, lng: 32.5936 },
    collectionStatus: 'active',
    paymentStatus: 'paid',
    garbageStatus: 'collected',
    nextCollectionDate: '2024-07-27',
    nextPaymentDueDate: '2024-08-09',
    balance: 0,
    paymentHistory: [
      { id: 'PAY005', date: '2024-06-27', amount: 1500, status: 'paid' },
    ],
    sharesLocation: false,
    routeId: 'ROUTE03',
  },
];

const VEH01_Fuel: FuelLogEntry[] = [
    { id: 'F01', date: '2024-07-17', liters: 100, cost: 9000, odometer: 149500, fuelType: 'Diesel' },
    { id: 'F02', date: '2024-07-07', liters: 120, cost: 10800, odometer: 148300, fuelType: 'Diesel' }
];

const VEH01_Maint: MaintenanceLogEntry[] = [
    { id: 'M01', date: '2024-05-23', description: 'Oil change and filter replacement', cost: 5000, odometer: 145000 }
];

const VEH02_Fuel: FuelLogEntry[] = [
    { id: 'F03', date: '2024-07-20', liters: 50, cost: 4250, odometer: 89600, fuelType: 'Gasoline' },
];

export const DUMMY_VEHICLES: Vehicle[] = [
    {
        id: 'VEH01',
        type: 'Garbage Truck',
        fuelType: 'Diesel',
        capacity: 10000,
        licensePlate: 'M-01-AB',
        status: 'available',
        nextMaintenance: '2024-09-05',
        odometer: 150234,
        lastServiceDate: '2024-05-23',
        lastDriverId: 'WRK03',
        fuelLog: VEH01_Fuel,
        maintenanceLog: VEH01_Maint,
    },
    {
        id: 'VEH02',
        type: 'Recycling Van',
        fuelType: 'Gasoline',
        capacity: 2500,
        licensePlate: 'M-02-CD',
        status: 'in-use',
        nextMaintenance: '2024-08-06',
        odometer: 89765,
        lastServiceDate: '2024-06-22',
        lastDriverId: 'WRK01',
        fuelLog: VEH02_Fuel,
        maintenanceLog: [],
    },
    {
        id: 'VEH03',
        type: 'Garbage Truck',
        fuelType: 'Diesel',
        capacity: 12000,
        licensePlate: 'M-03-EF',
        status: 'maintenance',
        nextMaintenance: '2024-07-20',
        odometer: 210450,
        lastServiceDate: '2024-04-23',
        lastDriverId: null,
        fuelLog: [],
        maintenanceLog: [
            { id: 'M02', date: '2024-07-20', description: 'Engine diagnostics', cost: 15000, odometer: 210440 }
        ],
    },
];

const peterParkerTimesheet: TimesheetEntry[] = [
    { date: '2024-07-21', checkIn: '08:05', checkOut: '17:02', totalHours: 8.9 },
    { date: '2024-07-20', checkIn: '07:58', checkOut: '17:05', totalHours: 9.1 },
    { date: '2024-07-19', checkIn: '08:10', checkOut: '16:55', totalHours: 8.7 },
    { date: '2024-07-18', checkIn: '08:00', checkOut: '17:00', totalHours: 9.0 },
];

export const DUMMY_WORKERS: Worker[] = [
    {
        id: 'WRK01',
        name: 'Peter Parker',
        role: 'Driver',
        employmentType: 'permanent',
        wage: 1200, // per hour
        status: 'working',
        assignedVehicleId: 'VEH02',
        lastCheckIn: '08:05 AM',
        imageUrl: 'https://placehold.co/100x100.png',
        timesheet: peterParkerTimesheet,
    },
    {
        id: 'WRK02',
        name: 'Mary Jane',
        role: 'Picker',
        employmentType: 'occasional',
        wage: 800, // per hour
        status: 'working',
        assignedVehicleId: 'VEH02',
        lastCheckIn: '08:15 AM',
        imageUrl: '',
        timesheet: [],
    },
    {
        id: 'WRK03',
        name: 'Bruce Wayne',
        role: 'Driver',
        employmentType: 'permanent',
        wage: 1350, // per hour
        status: 'on-leave',
        assignedVehicleId: null,
        lastCheckIn: null,
        imageUrl: '',
        timesheet: [],
    }
];

export const DUMMY_ASSIGNMENTS: Assignment[] = [
    {
        id: 'ASG01',
        workerId: 'WRK01',
        vehicleId: 'VEH02',
        date: '2024-07-22',
        taskDescription: 'Rota do Centro da Cidade',
        status: 'active',
    },
    {
        id: 'ASG02',
        workerId: 'WRK02',
        vehicleId: 'VEH02',
        date: '2024-07-22',
        taskDescription: 'Assistência na Rota do Centro da Cidade',
        status: 'active',
    },
    {
        id: 'ASG03',
        workerId: 'WRK03',
        vehicleId: 'VEH01',
        date: '2024-07-21',
        taskDescription: 'Coleta do Parque Industrial',
        status: 'completed',
    }
];

export const DUMMY_TRANSACTIONS: Transaction[] = [
    // Income from clients
    { id: 'TRN001', date: '2024-07-17', amount: 1500, type: 'income', category: 'Client Payment', description: 'Monthly fee for Julio Silva (CLI001)' },
    { id: 'TRN002', date: '2024-07-10', amount: 1500, type: 'income', category: 'Client Payment', description: 'Payment from Mariana Costa (CLI002)' },
    { id: 'TRN003', date: '2024-06-27', amount: 1500, type: 'income', category: 'Client Payment', description: 'Monthly fee for Sofia Lopes (CLI006)' },
    { id: 'TRN004', date: '2024-06-24', amount: 1500, type: 'income', category: 'Client Payment', description: 'Payment from Paulo Santos (CLI005)' },
    { id: 'TRN005', date: '2024-06-15', amount: 1500, type: 'income', category: 'Client Payment', description: 'Late payment from Carlos Pereira (CLI003)' },

    // Expenses
    { id: 'TRN006', date: '2024-07-20', amount: 8500, type: 'expense', category: 'Fuel', description: 'Diesel for VEH01 and VEH03' },
    { id: 'TRN007', date: '2024-07-15', amount: 25000, type: 'expense', category: 'Maintenance', description: 'Engine repair for VEH03' },
    { id: 'TRN008', date: '2024-07-01', amount: 120000, type: 'expense', category: 'Salaries', description: 'Monthly payroll - Peter Parker' },
    { id: 'TRN009', date: '2024-07-01', amount: 50000, type: 'expense', category: 'Salaries', description: 'Monthly payroll - Mary Jane' },
    { id: 'TRN010', date: '2024-07-07', amount: 3000, type: 'expense', category: 'Other', description: 'Purchase of new gloves and safety vests' },
    { id: 'TRN011', date: '2024-06-18', amount: 15000, type: 'expense', category: 'Fuel', description: 'Monthly fuel expense' },
];
