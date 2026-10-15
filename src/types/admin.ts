export type RoleType = 'worker' | 'employer';
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT_REQUIRED' | 'NOT_STARTED';

export interface UserProfile {
  userId: string;
  name: string;
  fullName?: string;
  workerName?: string;
  employerName?: string;
  businessName?: string;
  email: string;
  phone: string;
  roleType: RoleType;
  hasBothRoles?: boolean;
  kycStatus: KycStatus;
  workerKycStatus?: string;
  employerKycStatus?: string;
  idType?: string;
  idCardNumber?: string;
  trustScore: number;
  walletBalance?: number;
  razorpayAccountId?: string;
  upiId?: string;
  isBankVerified?: boolean;
  accountStatus?: string;
  isSuspended?: boolean;
  avatarUrl: string;
  city: string;
  state?: string;
  address?: string;
  pincode?: string;
  createdAt: string;
  updatedAt?: string;
  organizationId?: string;
  organizationName?: string;
}

export interface KycDetail {
  userId: string;
  name: string;
  fullName?: string;
  workerName?: string;
  employerName?: string;
  businessName?: string;
  email: string;
  phone: string;
  roleType: RoleType;
  hasBothRoles?: boolean;
  kycStatus: KycStatus;
  workerKycStatus?: string;
  employerKycStatus?: string;
  accountStatus?: string;
  isSuspended?: boolean;
  submittedAt: string;
  updatedAt?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  occupation?: string;
  headline?: string;
  bio?: string;
  skills?: string;
  idType?: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  panNumber: string;
  panPhotoUrl: string;
  selfieUrl: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  razorpayAccountId?: string;
  isBankVerified?: boolean;
  walletBalance?: number;
  amountInEscrow?: number;
  trustScore?: number;
  completedOrders?: number;
  activeOrders?: number;
  postedZigs?: number;
  referralCode?: string;
  workerReferralCode?: string;
  employerReferralCode?: string;
  diditStatus: 'VERIFIED' | 'FAILED' | 'PENDING_MANUAL_REVIEW' | 'NOT_STARTED';
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

export interface TaskApplicantRecord {
  id: string;
  taskId: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  workerAvatar?: string;
  trustScore: number;
  rating: number;
  kycStatus: string;
  status: string; // 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt: string;
  bidAmount?: number | null;
  pitchMessage?: string | null;
  checkInPhoto?: string | null;
  checkOutPhoto?: string | null;
  completedAt?: string | null;
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
  workersAssigned: number;
  applicationCount: number;
  applications: TaskApplicantRecord[];
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface DailyTimeWindowRecord {
  slotKey: string;
  label: string;
  shortLabel: string;
  period: string;
  startHour: number;
  endHour: number;
  userCount: number;
  applicationCount: number;
  percentage: number;
}

export interface DayRegisteredUserRecord {
  id: string;
  name: string;
  phone: string;
  role: string;
  kycStatus: string;
  timeIST: string;
  hourIST: number;
  createdAt: string;
  avatar?: string;
  city?: string;
}

export interface DayJobApplicationRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  taskCategory: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  status: string;
  timeIST: string;
  hourIST: number;
  createdAt: string;
}

export interface DailyGrowthTrendRecord {
  dateKey: string;
  month: string;
  fullDate: string;
  userSignups: number;
  applicationsCount: number;
  zigsPosted: number;
  zigsCompleted: number;
  hourlyBreakdown: DailyTimeWindowRecord[];
  hourlyCounts: number[];
  users: DayRegisteredUserRecord[];
  applications: DayJobApplicationRecord[];
}

export interface ManualKycQueueItem {
  id: string;
  fullName: string;
  legalName?: string;
  dob?: string;
  gender?: string;
  mobile: string;
  role: RoleType;
  workerName?: string;
  employerName?: string;
  businessName?: string;
  employerType?: string;
  kycMethod?: string;
  kycSubmittedAt?: string | null;
  kycReviewedAt?: string | null;
  kycReviewedBy?: string | null;
  idCardFrontUrl?: string | null;
  idCardBackUrl?: string | null;
  selfieUrl?: string | null;
  workerKycStatus?: string;
  employerKycStatus?: string;
  kycStatus?: string;
  idCardNumber?: string | null;
  idType?: string | null;
  rejectionReason?: string | null;
  accountStatus?: string;
  hasDocuments: boolean;
  avatarUrl?: string;
  city?: string;
  createdAt: string;
}
