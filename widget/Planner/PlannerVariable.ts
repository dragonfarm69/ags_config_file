export type PlanFileMeta = {
  id: string
  title: string
  filePath: string
  createDate: string
  lastSaved: string
}

export interface PlannerData {
  plans: Plans[]; 
  lastSaved?: string;
}

export interface PlanItem {
  title: string;
  description: string;
  created_date: string;
  updated_date: string;
  deadline: string;
}

export interface Plans {
  title: string;
  items: PlanItem[];
}