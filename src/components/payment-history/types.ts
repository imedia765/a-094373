export interface Payment {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
  member_name?: string;
  member_number?: string;
  collector_name?: string;
}