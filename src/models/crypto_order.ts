export type CryptoOrderStatus = 'completed' | 'pending' | 'failed';

export interface CryptoOrder {
  id: number;
  url: string;
  email: string;
  password: string;
  valid: boolean;
  severity: 'MENOS GRAVE' | 'GRAVE' | 'MUITO GRAVE' | '';
}


