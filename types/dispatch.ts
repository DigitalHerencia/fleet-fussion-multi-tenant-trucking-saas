// Shared types for dispatch feature

export interface Load {
  id: string;
  referenceNumber: string;
  status: string;
  customerName: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pickupDate: Date;
  deliveryDate: Date;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  vehicle?: {
    id: string;
    unitNumber: string;
  } | null;
}

export interface LoadCardProps {
  load: Load;
  onClick: () => void;
}
