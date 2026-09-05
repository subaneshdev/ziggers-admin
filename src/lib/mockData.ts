import { 
  UserProfile, 
  KycDetail, 
  Dispute, 
  FraudAlert, 
  Organization, 
  OrganizationDetail, 
  AnalyticsSnapshot,
  OverviewMetrics
} from '../types/admin';

// 1. Initial KYC Pending Queue
export const INITIAL_KYC_PROFILES: UserProfile[] = [
  {
    userId: 'usr_w_001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    roleType: 'worker',
    kycStatus: 'PENDING',
    trustScore: 85,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    city: 'Bengaluru',
    createdAt: '2026-08-08T10:15:00Z',
  },
  {
    userId: 'usr_w_002',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98123 45678',
    roleType: 'worker',
    kycStatus: 'PENDING',
    trustScore: 92,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    city: 'Mumbai',
    createdAt: '2026-08-09T14:30:00Z',
  },
  {
    userId: 'usr_e_001',
    name: 'Vikramaditya Rao',
    email: 'vikram@apexlogistics.in',
    phone: '+91 99000 11223',
    roleType: 'employer',
    kycStatus: 'PENDING',
    trustScore: 78,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    city: 'Delhi NCR',
    createdAt: '2026-08-10T09:00:00Z',
    organizationName: 'Apex Logistics Corp',
  },
  {
    userId: 'usr_w_003',
    name: 'Rohan Verma',
    email: 'rohan.v@example.com',
    phone: '+91 97788 99001',
    roleType: 'worker',
    kycStatus: 'PENDING',
    trustScore: 88,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    city: 'Hyderabad',
    createdAt: '2026-08-11T08:12:00Z',
  },
  {
    userId: 'usr_e_002',
    name: 'Neha Sundaram',
    email: 'neha@swiftretail.com',
    phone: '+91 96655 44332',
    roleType: 'employer',
    kycStatus: 'PENDING',
    trustScore: 95,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    city: 'Chennai',
    createdAt: '2026-08-11T11:45:00Z',
    organizationName: 'Swift Retail Solutions',
  }
];

// 2. KYC Details Store
export const INITIAL_KYC_DETAILS: Record<string, KycDetail> = {
  'usr_w_001': {
    userId: 'usr_w_001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    roleType: 'worker',
    kycStatus: 'PENDING',
    submittedAt: '2026-08-08T10:15:00Z',
    aadhaarNumber: 'XXXX-XXXX-4819',
    aadhaarFrontUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    aadhaarBackUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    panNumber: 'ABCPS4819K',
    panPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50100239481920',
    ifscCode: 'HDFC0001234',
    diditStatus: 'VERIFIED',
    diditConfidence: 98.4,
    diditFaceMatch: true,
    diditLivenessPassed: true,
    diditMatchScore: 99.1,
    notes: 'Didit passive liveness checks passed cleanly. Aadhaar & PAN OCR matched DB record.',
    fieldComparison: [
      { field: 'Full Name', submittedValue: 'Aarav Sharma', governmentDbValue: 'Aarav Sharma', isMatching: true },
      { field: 'Date of Birth', submittedValue: '14-06-1998', governmentDbValue: '14-06-1998', isMatching: true },
      { field: 'PAN Number', submittedValue: 'ABCPS4819K', governmentDbValue: 'ABCPS4819K', isMatching: true },
      { field: 'Aadhaar Last 4', submittedValue: '4819', governmentDbValue: '4819', isMatching: true },
      { field: 'Address City', submittedValue: 'Bengaluru', governmentDbValue: 'Bengaluru', isMatching: true },
    ]
  },
  'usr_w_002': {
    userId: 'usr_w_002',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98123 45678',
    roleType: 'worker',
    kycStatus: 'PENDING',
    submittedAt: '2026-08-09T14:30:00Z',
    aadhaarNumber: 'XXXX-XXXX-9902',
    aadhaarFrontUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    aadhaarBackUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    panNumber: 'BPZPP9902L',
    panPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    selfieUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
    bankName: 'ICICI Bank Ltd',
    accountNumber: '001105029384',
    ifscCode: 'ICIC0000011',
    diditStatus: 'VERIFIED',
    diditConfidence: 96.2,
    diditFaceMatch: true,
    diditLivenessPassed: true,
    diditMatchScore: 97.0,
    fieldComparison: [
      { field: 'Full Name', submittedValue: 'Priya Patel', governmentDbValue: 'Priya Patel', isMatching: true },
      { field: 'Date of Birth', submittedValue: '22-11-2001', governmentDbValue: '22-11-2001', isMatching: true },
      { field: 'PAN Number', submittedValue: 'BPZPP9902L', governmentDbValue: 'BPZPP9902L', isMatching: true },
    ]
  },
  'usr_e_001': {
    userId: 'usr_e_001',
    name: 'Vikramaditya Rao',
    email: 'vikram@apexlogistics.in',
    phone: '+91 99000 11223',
    roleType: 'employer',
    kycStatus: 'PENDING',
    submittedAt: '2026-08-10T09:00:00Z',
    aadhaarNumber: 'XXXX-XXXX-1100',
    aadhaarFrontUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    aadhaarBackUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    panNumber: 'AAACA1100M',
    panPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    bankName: 'State Bank of India',
    accountNumber: '33445566778',
    ifscCode: 'SBIN0000800',
    diditStatus: 'PENDING_MANUAL_REVIEW',
    diditConfidence: 84.0,
    diditFaceMatch: true,
    diditLivenessPassed: true,
    diditMatchScore: 85.5,
    notes: 'Company GSTIN verified. Slight mismatch on address format, manual inspection recommended.',
    fieldComparison: [
      { field: 'Full Name', submittedValue: 'Vikramaditya Rao', governmentDbValue: 'Vikramaditya Rao', isMatching: true },
      { field: 'GSTIN Legal Name', submittedValue: 'Apex Logistics India Pvt Ltd', governmentDbValue: 'Apex Logistics India Private Limited', isMatching: true },
      { field: 'PAN Number', submittedValue: 'AAACA1100M', governmentDbValue: 'AAACA1100M', isMatching: true },
    ]
  }
};

// 3. Contested Disputes
export const INITIAL_DISPUTES: Dispute[] = [
  {
    disputeId: 'dsp_8819',
    zigId: 'zig_8801',
    zigTitle: 'Warehouse Inventory Audit & Barcode Scan (500 items)',
    category: 'Warehouse & Logistics',
    workerId: 'usr_w_001',
    workerName: 'Aarav Sharma',
    workerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    employerId: 'usr_e_001',
    employerName: 'Apex Logistics Corp',
    employerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    escrowAmount: 4500,
    status: 'OPEN',
    createdAt: '2026-08-10T16:20:00Z',
    description: 'Employer claims worker left at 4:30 PM without completing 80 items in Rack C. Worker uploaded photos showing all 500 barcodes logged on mobile scanner.',
    workerClaim: 'Completed all 500 barcode scans before 5 PM limit. Uploaded CSV export & photo proof of completed Rack C tags.',
    employerClaim: 'Floor manager inspected Rack C and found 80 boxes unverified. Worker logged out early.',
    workerEvidence: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800'
    ],
    employerEvidence: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    disputeId: 'dsp_8820',
    zigId: 'zig_8812',
    zigTitle: 'Event Catering Setup & Table Management (4 Hours)',
    category: 'Event Staffing',
    workerId: 'usr_w_002',
    workerName: 'Priya Patel',
    workerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    employerId: 'usr_e_002',
    employerName: 'Swift Retail Solutions',
    employerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    escrowAmount: 2800,
    status: 'INVESTIGATING',
    createdAt: '2026-08-09T18:00:00Z',
    description: 'Worker reported 45 minutes late due to venue gate security access issues. Employer requested 25% penalty deduction.',
    workerClaim: 'Arrived at gate at 5:45 PM. Security denied entry until employer provided badge at 6:30 PM. Worked 45 mins past end time to make up.',
    employerClaim: 'Event start was delayed because setup was incomplete at 6 PM. Gate pass was issued in advance via email.',
    workerEvidence: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800'
    ],
    employerEvidence: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

// 4. Fraud & Risk Monitoring Alerts
export const INITIAL_FRAUD_ALERTS: FraudAlert[] = [
  {
    alertId: 'frd_9001',
    userId: 'usr_w_901',
    userName: 'Karan Malhotra',
    userRole: 'worker',
    riskScore: 94,
    alertType: 'LOCATION_SPOOFING',
    severity: 'CRITICAL',
    details: 'Mock Location API detected on Android client during check-in for Zig #4421. GPS coordinates jumped 42km in 3 seconds.',
    ipAddress: '49.207.192.11',
    deviceId: 'Android-Pixel-7a-9a8b7c6d',
    location: 'Bengaluru, KA',
    timestamp: '2026-08-11T14:02:10Z',
    status: 'ACTIVE'
  },
  {
    alertId: 'frd_9002',
    userId: 'usr_w_902',
    userName: 'Suresh Kumar',
    userRole: 'worker',
    riskScore: 82,
    alertType: 'IMPOSSIBLE_VELOCITY',
    severity: 'HIGH',
    details: 'User completed check-in in Koramangala at 13:10 and checked in at Whitefield at 13:14 (distance 18km).',
    ipAddress: '157.48.21.99',
    deviceId: 'Android-OnePlus11-ff00aa',
    location: 'Bengaluru, KA',
    timestamp: '2026-08-11T13:14:45Z',
    status: 'FLAGGED'
  },
  {
    alertId: 'frd_9003',
    userId: 'usr_e_903',
    userName: 'Horizon Marketing Services',
    userRole: 'employer',
    riskScore: 78,
    alertType: 'DUPLICATE_DEVICE_ID',
    severity: 'HIGH',
    details: 'Device ID matched previously banned employer account (usr_e_302) linked to chargeback fraud.',
    ipAddress: '103.110.24.12',
    deviceId: 'MacBookPro-16-M2-a1b2c3d4',
    location: 'Mumbai, MH',
    timestamp: '2026-08-11T11:30:00Z',
    status: 'ACTIVE'
  }
];

// 5. B2B Corporate Organizations
export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    orgId: 'org_001',
    name: 'Apex Logistics India',
    logoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=200',
    active: true,
    memberCount: 24,
    activeZigsCount: 142,
    totalSpend: 1845000,
    tier: 'ENTERPRISE',
    createdAt: '2025-11-15T00:00:00Z',
    contactEmail: 'billing@apexlogistics.in',
    contactPhone: '+91 80 4455 6677',
    taxId: '29AAAAA0000A1Z5'
  },
  {
    orgId: 'org_002',
    name: 'Swift Retail Solutions',
    logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    active: true,
    memberCount: 12,
    activeZigsCount: 68,
    totalSpend: 920000,
    tier: 'GROWTH',
    createdAt: '2026-01-10T00:00:00Z',
    contactEmail: 'ops@swiftretail.com',
    contactPhone: '+91 44 2233 4455',
    taxId: '33BBBBB1111B2Z6'
  },
  {
    orgId: 'org_003',
    name: 'Metro Event Management',
    logoUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=200',
    active: false,
    memberCount: 5,
    activeZigsCount: 0,
    totalSpend: 150000,
    tier: 'BASIC',
    createdAt: '2026-03-22T00:00:00Z',
    contactEmail: 'events@metro.co.in',
    contactPhone: '+91 11 9988 7766',
    taxId: '07CCCCC2222C3Z7'
  }
];

export const INITIAL_ORG_DETAILS: Record<string, OrganizationDetail> = {
  'org_001': {
    org: INITIAL_ORGANIZATIONS[0],
    members: [
      { id: 'm_01', name: 'Vikramaditya Rao', email: 'vikram@apexlogistics.in', role: 'ADMIN', joinedAt: '2025-11-15', status: 'ACTIVE' },
      { id: 'm_02', name: 'Sunil Mehta', email: 'sunil.m@apexlogistics.in', role: 'MANAGER', joinedAt: '2025-12-01', status: 'ACTIVE' },
      { id: 'm_03', name: 'Kavita Menon', email: 'kavita@apexlogistics.in', role: 'BILLING_CONTACT', joinedAt: '2026-02-10', status: 'ACTIVE' },
    ],
    postedZigs: [
      { id: 'zig_901', title: 'Warehouse Packing & Dispatch - Shift A', category: 'Logistics', workerCount: 45, budgetPerWorker: 850, status: 'IN_PROGRESS', postedAt: '2026-08-11' },
      { id: 'zig_902', title: 'Forklift Operators (Certified)', category: 'Logistics', workerCount: 12, budgetPerWorker: 1400, status: 'POSTED', postedAt: '2026-08-10' },
      { id: 'zig_880', title: 'Inventory Reconciliation - Q2', category: 'Logistics', workerCount: 80, budgetPerWorker: 900, status: 'COMPLETED', postedAt: '2026-07-30' },
    ],
    invoices: [
      { id: 'inv_2026_08', invoiceNumber: 'INV-APX-2026-008', amount: 485000, date: '2026-08-01', dueDate: '2026-08-15', status: 'PAID' },
      { id: 'inv_2026_07', invoiceNumber: 'INV-APX-2026-007', amount: 520000, date: '2026-07-01', dueDate: '2026-07-15', status: 'PAID' },
      { id: 'inv_2026_06', invoiceNumber: 'INV-APX-2026-006', amount: 440000, date: '2026-06-01', dueDate: '2026-06-15', status: 'PAID' },
    ]
  }
};

// 6. Precomputed Analytics Snapshots (8 Engine Modules)
export const INITIAL_ANALYTICS: Record<string, AnalyticsSnapshot> = {
  'overview': {
    metricKey: 'overview',
    updatedAt: new Date().toISOString(),
    data: {
      gmv: 42850000, // ₹4.28 Cr
      totalRevenue: 6427500, // 15% platform take rate = ₹64.27 L
      activeZigs: 1482,
      completedZigs: 38420,
      totalWorkers: 24500,
      totalEmployers: 3120,
      openDisputes: 14,
      gmvGrowthMoM: 18.4,
      revenueGrowthMoM: 21.2,
    } as OverviewMetrics
  },
  'work_categories': {
    metricKey: 'work_categories',
    updatedAt: new Date().toISOString(),
    data: [
      { category: 'Warehouse & Logistics', completionRate: 96.2, growthTrend: 24.5, totalZigs: 14200 },
      { category: 'Retail & Merchandising', completionRate: 94.8, growthTrend: 18.2, totalZigs: 9800 },
      { category: 'Event Staffing & Hospitality', completionRate: 92.1, growthTrend: 31.0, totalZigs: 6400 },
      { category: 'Field Delivery & Express', completionRate: 97.5, growthTrend: 14.8, totalZigs: 11200 },
      { category: 'Promotions & Field Sales', completionRate: 89.4, growthTrend: 9.6, totalZigs: 3100 },
      { category: 'Administrative & Data', completionRate: 95.0, growthTrend: 12.3, totalZigs: 2800 },
    ]
  },
  'worker_demographics': {
    metricKey: 'worker_demographics',
    updatedAt: new Date().toISOString(),
    data: {
      ageDistribution: [
        { group: '18-21', percentage: 28, count: 6860 },
        { group: '22-25', percentage: 42, count: 10290 },
        { group: '26-30', percentage: 20, count: 4900 },
        { group: '31-40', percentage: 8, count: 1960 },
        { group: '40+', percentage: 2, count: 490 },
      ],
      genderSplit: [
        { name: 'Male', value: 64, count: 15680 },
        { name: 'Female', value: 33, count: 8085 },
        { name: 'Other/Non-binary', value: 3, count: 735 },
      ],
      occupationStatus: [
        { label: 'College Students', percentage: 45 },
        { label: 'Full-time Gig Workers', percentage: 35 },
        { label: 'Part-time Workers', percentage: 15 },
        { label: 'Others', percentage: 5 },
      ]
    }
  },
  'worker_income': {
    metricKey: 'worker_income',
    updatedAt: new Date().toISOString(),
    data: {
      avgWeeklyEarnings: 4850,
      medianWeeklyEarnings: 4200,
      avgMonthlyEarnings: 19400,
      medianMonthlyEarnings: 16800,
      histogram: [
        { range: '₹0 - ₹2k', count: 1400 },
        { range: '₹2k - ₹5k', count: 5200 },
        { range: '₹5k - ₹10k', count: 9800 },
        { range: '₹10k - ₹20k', count: 6100 },
        { range: '₹20k - ₹35k', count: 1600 },
        { range: '₹35k+', count: 400 },
      ]
    }
  },
  'employer_metrics': {
    metricKey: 'employer_metrics',
    updatedAt: new Date().toISOString(),
    data: {
      activeEmployers: 3120,
      paymentReliabilityRate: 98.6, // %
      cancellationRate: 2.1, // %
      repeatEmployerRate: 84.3, // %
      monthlyTrend: [
        { month: 'Mar', active: 2100, reliability: 97.5, repeat: 79.2 },
        { month: 'Apr', active: 2350, reliability: 97.8, repeat: 80.5 },
        { month: 'May', active: 2580, reliability: 98.1, repeat: 81.9 },
        { month: 'Jun', active: 2790, reliability: 98.3, repeat: 82.8 },
        { month: 'Jul', active: 2950, reliability: 98.4, repeat: 83.5 },
        { month: 'Aug', active: 3120, reliability: 98.6, repeat: 84.3 },
      ]
    }
  },
  'trust_safety': {
    metricKey: 'trust_safety',
    updatedAt: new Date().toISOString(),
    data: {
      avgPlatformTrustScore: 91.4,
      disputeRate: 0.36, // %
      workerBackoutRate: 1.82, // %
      history: [
        { date: 'W1 Jul', avgScore: 89.2, disputeRate: 0.52, backoutRate: 2.40 },
        { date: 'W2 Jul', avgScore: 89.8, disputeRate: 0.48, backoutRate: 2.15 },
        { date: 'W3 Jul', avgScore: 90.3, disputeRate: 0.42, backoutRate: 1.95 },
        { date: 'W4 Jul', avgScore: 90.7, disputeRate: 0.39, backoutRate: 1.90 },
        { date: 'W1 Aug', avgScore: 91.1, disputeRate: 0.37, backoutRate: 1.85 },
        { date: 'W2 Aug', avgScore: 91.4, disputeRate: 0.36, backoutRate: 1.82 },
      ]
    }
  },
  'geographic': {
    metricKey: 'geographic',
    updatedAt: new Date().toISOString(),
    data: [
      { city: 'Bengaluru', activeZigs: 480, workerCount: 8400, gmvShare: 32.5, growthMoM: 22.1 },
      { city: 'Mumbai', activeZigs: 360, workerCount: 6200, gmvShare: 24.8, growthMoM: 18.4 },
      { city: 'Delhi NCR', activeZigs: 290, workerCount: 4900, gmvShare: 19.2, growthMoM: 16.0 },
      { city: 'Hyderabad', activeZigs: 180, workerCount: 2800, gmvShare: 12.1, growthMoM: 25.8 },
      { city: 'Chennai', activeZigs: 112, workerCount: 1600, gmvShare: 7.4, growthMoM: 14.2 },
      { city: 'Pune', activeZigs: 60, workerCount: 600, gmvShare: 4.0, growthMoM: 28.5 },
    ]
  },
  'growth_trends': {
    metricKey: 'growth_trends',
    updatedAt: new Date().toISOString(),
    data: [
      { month: 'Jan', userSignups: 2400, gmvLakhs: 210, zigsCompleted: 18500 },
      { month: 'Feb', userSignups: 2850, gmvLakhs: 245, zigsCompleted: 21200 },
      { month: 'Mar', userSignups: 3400, gmvLakhs: 290, zigsCompleted: 25800 },
      { month: 'Apr', userSignups: 3950, gmvLakhs: 335, zigsCompleted: 29400 },
      { month: 'May', userSignups: 4600, gmvLakhs: 380, zigsCompleted: 33100 },
      { month: 'Jun', userSignups: 5200, gmvLakhs: 415, zigsCompleted: 36800 },
      { month: 'Jul', userSignups: 5900, gmvLakhs: 428.5, zigsCompleted: 38420 },
    ]
  }
};
