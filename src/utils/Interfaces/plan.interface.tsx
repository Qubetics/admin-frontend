// interfaces/plan.interfaces.tsx

export interface Plan {
  id: string;
  prov_address: string;
  gigabytes: string;
  hours: string;
  prices: { denom: string; amount: string }[]; // adjust if your API returns different keys
  status: string;
  status_at: string;
}
