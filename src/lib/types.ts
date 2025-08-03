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
