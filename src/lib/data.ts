
import type { Client, Route, DayOfWeek, Vehicle, Worker, TimesheetEntry, Assignment } from './types';
import { subDays, addDays, format } from 'date-fns';

const today = new Date();

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
    nextCollectionDate: format(addDays(today, 6), 'yyyy-MM-dd'),
    nextPaymentDueDate: format(addDays(today, 25), 'yyyy-MM-dd'),
    balance: 0,
    paymentHistory: [
      { id: 'PAY001', date: format(subDays(today, 30), 'yyyy-MM-dd'), amount: 1500, status: 'paid' },
      { id: 'PAY002', date: format(subDays(today, 60), 'yyyy-MM-dd'), amount: 1500, status: 'paid' },
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
    nextCollectionDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    nextPaymentDueDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    balance: 1500,
    paymentHistory: [
      { id: 'PAY003', date: format(subDays(today, 35), 'yyyy-MM-dd'), amount: 1500, status: 'paid' },
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
    nextCollectionDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    nextPaymentDueDate: format(subDays(today, 10), 'yyyy-MM-dd'),
    balance: 3000,
    paymentHistory: [],
    sharesLocation: true,
    routeId: 'ROUTE02',
  },
  {
    id: 'CLI004',
    name: 'Ana Rodrigues',
    address: 'Av. da Marginal, 101, Maputo',
    coordinates: { lat: -25.9818, lng: 32.5940 },
    collectionStatus: 'suspended',
    paymentStatus: 'overdue',
    garbageStatus: 'missed',
    nextCollectionDate: 'N/A',
    nextPaymentDueDate: format(subDays(today, 40), 'yyyy-MM-dd'),
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
    nextCollectionDate: format(addDays(today, 4), 'yyyy-MM-dd'),
    nextPaymentDueDate: format(addDays(today, 20), 'yyyy-MM-dd'),
    balance: 0,
    paymentHistory: [
      { id: 'PAY004', date: format(subDays(today, 28), 'yyyy-MM-dd'), amount: 1500, status: 'paid' },
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
    nextCollectionDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    nextPaymentDueDate: format(addDays(today, 18), 'yyyy-MM-dd'),
    balance: 0,
    paymentHistory: [
      { id: 'PAY005', date: format(subDays(today, 25), 'yyyy-MM-dd'), amount: 1500, status: 'paid' },
    ],
    sharesLocation: false,
    routeId: 'ROUTE03',
  },
];

export const DUMMY_VEHICLES: Vehicle[] = [
    {
        id: 'VEH01',
        type: 'Garbage Truck',
        fuelType: 'Diesel',
        capacity: 10000, // in kg
        licensePlate: 'M-01-AB',
        status: 'available',
        nextMaintenance: format(addDays(today, 45), 'yyyy-MM-dd'),
    },
    {
        id: 'VEH02',
        type: 'Recycling Van',
        fuelType: 'Gasoline',
        capacity: 2500, // in kg
        licensePlate: 'M-02-CD',
        status: 'in-use',
        nextMaintenance: format(addDays(today, 15), 'yyyy-MM-dd'),
    },
    {
        id: 'VEH03',
        type: 'Garbage Truck',
        fuelType: 'Diesel',
        capacity: 12000, // in kg
        licensePlate: 'M-03-EF',
        status: 'maintenance',
        nextMaintenance: format(subDays(today, 2), 'yyyy-MM-dd'),
    },
];

const peterParkerTimesheet: TimesheetEntry[] = [
    { date: format(subDays(today, 1), 'yyyy-MM-dd'), checkIn: '08:05', checkOut: '17:02', totalHours: 8.9 },
    { date: format(subDays(today, 2), 'yyyy-MM-dd'), checkIn: '07:58', checkOut: '17:05', totalHours: 9.1 },
    { date: format(subDays(today, 3), 'yyyy-MM-dd'), checkIn: '08:10', checkOut: '16:55', totalHours: 8.7 },
    { date: format(subDays(today, 4), 'yyyy-MM-dd'), checkIn: '08:00', checkOut: '17:00', totalHours: 9.0 },
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
        date: format(today, 'yyyy-MM-dd'),
        taskDescription: 'Rota do Centro da Cidade',
        status: 'active',
    },
    {
        id: 'ASG02',
        workerId: 'WRK02',
        vehicleId: 'VEH02',
        date: format(today, 'yyyy-MM-dd'),
        taskDescription: 'Assistência na Rota do Centro da Cidade',
        status: 'active',
    },
    {
        id: 'ASG03',
        workerId: 'WRK03',
        vehicleId: 'VEH01',
        date: format(subDays(today, 1), 'yyyy-MM-dd'),
        taskDescription: 'Coleta do Parque Industrial',
        status: 'completed',
    }
];
