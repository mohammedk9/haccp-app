// src/types/dashboard.ts
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: { [key: string]: number };
  recent: {
    last30Days: number;
    activationRate: string | number;
  };
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    activePercentage: number;
  };
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  type: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CCP {
  id: string;
  name: string;
  description?: string;
  criticalLimit?: string;
  monitoringProcedure?: string;
  facility: {
    name: string;
  };
  hazard: {
    name: string;
  };
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface RecordData {
  id: string;
  value: string;
  status?: string;
  notes?: string;
  facility: {
    name: string;
  };
  ccp: {
    name: string;
  };
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface DashboardData {
  userStats?: UserStats;
  facilities?: Facility[];
  ccps?: CCP[];
  records?: RecordData[];
  facilitiesCount?: number;
  ccpsCount?: number;
  recordsCount?: number;
}
