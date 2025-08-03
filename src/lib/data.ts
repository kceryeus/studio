import type { Client, Route, DayOfWeek, Vehicle, Worker, TimesheetEntry } from './types';
import { subDays, addDays, format } from 'date-fns';

const today = new Date();

export const DUMMY_ROUTES: Route[] = [
    { id: 'ROUTE01', name: 'Downtown Route', weekdays: ['Monday', 'Thursday'] },
    { id: 'ROUTE02', name: 'Suburbia Line', weekdays: ['Tuesday', 'Friday'] },
    { id: 'ROUTE03', name: 'Industrial Park', weekdays: ['Wednesday'] },
];

export const DUMMY_CLIENTS: Client[] = [
  {
    id: 'CLI001',
    name: 'John Doe',
    address: '123 Maple Street, Springfield',
    coordinates: { lat: -18.916, lng: 34.845 },
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
    name: 'Jane Smith',
    address: '456 Oak Avenue, Springfield',
    coordinates: { lat: -18.922, lng: 34.855 },
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
    name: 'Bob Johnson',
    address: '789 Pine Lane, Springfield',
    coordinates: { lat: -25.965, lng: 32.583 },
    collectionStatus: 'active',
    paymentStatus: 'overdue',
    garbageStatus: 'pending',
    nextCollectionDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    nextPaymentDueDate: format(subDays(today, 10), 'yyyy-MM-dd'),
    balance: 3000,
    paymentHistory: [],
    sharesLocation: false,
    routeId: 'ROUTE02',
  },
  {
    id: 'CLI004',
    name: 'Alice Williams',
    address: '101 Elm Court, Springfield',
    coordinates: { lat: -25.970, lng: 32.575 },
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
    name: 'Charlie Brown',
    address: '212 Birch Road, Springfield',
    coordinates: { lat: -19.833, lng: 34.866 },
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
    name: 'Diana Prince',
    address: '333 Cedar Blvd, Springfield',
    coordinates: { lat: -19.825, lng: 34.858 },
    collectionStatus: 'active',
    paymentStatus: 'paid',
    garbageStatus: 'collected',
    nextCollectionDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    nextPaymentDueDate: format(addDays(today, 18), 'yyyy-MM-dd'),
    balance: 0,
    paymentHistory: [
      { id: 'PAY005', date: format(subDays(today, 25), 'yyyy-MM-dd'), amount: 1500, status: 'paid' },
    ],
    sharesLocation: true,
    routeId: 'ROUTE03',
  },
];

export const DUMMY_VEHICLES: Vehicle[] = [
    {
        id: 'VEH01',
        type: 'Garbage Truck',
        fuelType: 'Diesel',
        capacity: 10000, // in kg
        licensePlate: 'ABC-123',
        status: 'available',
        nextMaintenance: format(addDays(today, 45), 'yyyy-MM-dd'),
    },
    {
        id: 'VEH02',
        type: 'Recycling Van',
        fuelType: 'Gasoline',
        capacity: 2500, // in kg
        licensePlate: 'XYZ-789',
        status: 'in-use',
        nextMaintenance: format(addDays(today, 15), 'yyyy-MM-dd'),
    },
    {
        id: 'VEH03',
        type: 'Garbage Truck',
        fuelType: 'Diesel',
        capacity: 12000, // in kg
        licensePlate: 'DEF-456',
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
        timesheet: [],
    }
];
