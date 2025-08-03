export type CollectionStatus = 'active' | 'suspended';
export type PaymentStatus = 'paid' | 'due' | 'overdue';
export type GarbageStatus = 'collected' | 'pending' | 'missed' | 'out' | 'not-out';

export type Payment = {
  id: string;
  date: string;
  amount: number;
  status: 'paid';
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
};
