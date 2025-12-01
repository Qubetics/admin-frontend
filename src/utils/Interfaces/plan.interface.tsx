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
export interface CreatePlanModalProps {
  createShow: boolean;
  setCreateShow: React.Dispatch<React.SetStateAction<boolean>>;
  getAllPlan: () => Promise<void> | void;
  provAddress: string;
}

