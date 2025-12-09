export interface IMembershipRank {
  id: number;
  name: string;
}

export interface ICreateMembershipRank {
  name: string;
}
export interface IUpdateRoleMonthlyRates {
  id: number;
  effective_from: string;
  amount: number;
}

export interface IMonthlyRank {
  id: number;
  name: string;
  amount: number;
  role: IMembershipRank;
  effective_from: string;
}

export interface IMembershipRankDetails {
  id: number;
  name: string;
  monthlyRates: {
    id: number;
    amount: number;
    effective_from: string;
  }[];
}

export interface ICreateMonthlyRank {
  role: number;
  amount: number;
  effective_from: string;
}
