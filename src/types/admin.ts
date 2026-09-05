export type RoleType = 'worker' | 'employer';
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT_REQUIRED';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  roleType: RoleType;
  kycStatus: KycStatus;
  trustScore: number;
  avatarUrl: string;
  city: string;
  createdAt: string;
  organizationId?: string;
  organizationName?: string;
}

export interface KycDetail {
  userId: string;
  name: string;
  email: string;
  phone: string;
  roleType: RoleType;
  kycStatus: KycStatus;
  submittedAt: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  panNumber: string;
  panPhotoUrl: string;
  selfieUrl: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  diditStatus: 'VERIFIED' | 'FAILED' | 'PENDING_MANUAL_REVIEW';
  diditConfidence: number; // 0 - 100
  diditFaceMatch: boolean;
  diditLivenessPassed: boolean;
  diditMatchScore: number;
  notes?: string;
  fieldComparison: {
    field: string;
    submittedValue: string;
    governmentDbValue: string;
    isMatching: boolean;
  }[];
}

export type DisputeStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED_WORKER' | 'RESOLVED_EMPLOYER' | 'PARTIAL_SPLIT';

export interface Dispute {
  disputeId: string;
  zigId: string;
  zigTitle: string;
  category: string;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  employerId: string;
  employerName: string;
  employerAvatar: string;
  escrowAmount: number; // in INR
  status: DisputeStatus;
  createdAt: string;
  description: string;
  workerClaim: string;
  employerClaim: string;
  workerEvidence: string[];
  employerEvidence: string[];
  resolutionSummary?: string;
  escrowSplit?: EscrowSplit;
}

export type DisputeResolutionType = 'RESOLVED_WORKER' | 'RESOLVED_EMPLOYER' | 'PARTIAL_SPLIT';

export interface EscrowSplit {
  workerPercentage: number;
  employerPercentage: number;
  workerAmount: number;
  employerAmount: number;
  reason: string;
}

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertType = 
  | 'LOCATION_SPOOFING' 
  | 'IMPOSSIBLE_VELOCITY' 
  | 'DUPLICATE_DEVICE_ID' 
  | 'MULTIPLE_FAILED_KYC' 
  | 'SUSPICIOUS_PAYOUT';

export interface FraudAlert {
  alertId: string;
  userId: string;
  userName: string;
  userRole: RoleType;
  riskScore: number; // 0 - 100
  alertType: AlertType;
  severity: RiskSeverity;
  details: string;
  ipAddress: string;
  deviceId: string;
  location: string;
  timestamp: string;
  status: 'ACTIVE' | 'FLAGGED' | 'RESOLVED' | 'SUSPENDED';
}

export interface Organization {
  orgId: string;
  name: string;
  logoUrl: string;
  active: boolean;
  memberCount: number;
  activeZigsCount: number;
  totalSpend: number; // in INR
  tier: 'ENTERPRISE' | 'GROWTH' | 'BASIC';
  createdAt: string;
  contactEmail: string;
  contactPhone: string;
  taxId: string;
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'BILLING_CONTACT';
  joinedAt: string;
  status: 'ACTIVE' | 'INVITED';
}

export interface EnterpriseZig {
  id: string;
  title: string;
  category: string;
  workerCount: number;
  budgetPerWorker: number;
  status: 'POSTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  postedAt: string;
}

export interface OrgInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  pdfUrl?: string;
}

export interface OrganizationDetail {
  org: Organization;
  members: OrgMember[];
  postedZigs: EnterpriseZig[];
  invoices: OrgInvoice[];
}

export type AnalyticsMetricKey = 
  | 'overview' 
  | 'work_categories' 
  | 'worker_demographics' 
  | 'worker_income' 
  | 'employer_metrics' 
  | 'trust_safety' 
  | 'geographic' 
  | 'growth_trends';

export interface OverviewMetrics {
  gmv: number;
  totalRevenue: number;
  activeZigs: number;
  completedZigs: number;
  totalWorkers: number;
  totalEmployers: number;
  openDisputes: number;
  gmvGrowthMoM: number;
  revenueGrowthMoM: number;
}

export interface AnalyticsSnapshot {
  metricKey: AnalyticsMetricKey;
  updatedAt: string;
  data?: any;
  metricValue?: any;
}

export interface NewOrgPayload {
  name: string;
  contactEmail: string;
  contactPhone: string;
  tier: 'ENTERPRISE' | 'GROWTH' | 'BASIC';
  taxId: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerPhone: string;
  referredId: string;
  referredName: string;
  referredPhone: string;
  referralCode: string;
  status: 'waiting' | 'converted' | 'expired' | 'invalidated';
  rewardAmount: number;
  referralType: string;
  createdAt: string;
  convertedAt?: string;
}

export interface SupportTicketRecord {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  category: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'REPLIED' | 'CLOSED';
  createdAt: string;
  updatedAt?: string;
}

export interface PostedZigRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  payout: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdBy: string;
  createdByName: string;
  createdByPhone: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedToPhone?: string;
  locationName?: string;
  checkInPhoto?: string;
  checkOutPhoto?: string;
  proofPhotoUrl?: string;
  coverPhotoUrl?: string;
  workersRequired: number;
  workersAssigned?: number;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}



