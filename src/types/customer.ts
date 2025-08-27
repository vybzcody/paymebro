export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  totalSpent: string;
  totalTransactions: number;
  lastTransaction: string;
  status: 'active' | 'inactive';
  avatar: string;
  address?: string;
  company?: string;
  notes?: string;
}

export interface NewCustomerData {
  name: string;
  email: string;
  phone: string;
  location: string;
  address?: string;
  company?: string;
  notes?: string;
}

export interface CustomerFormData extends NewCustomerData {
  // Additional form-specific fields can be added here if needed
}
