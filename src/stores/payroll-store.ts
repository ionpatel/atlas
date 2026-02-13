import { create } from "zustand";

// 2026 Canadian Tax Constants
const TAX_CONSTANTS_2026 = {
  // CPP (Canada Pension Plan)
  cpp: {
    maxPensionableEarnings: 71300,
    basicExemption: 3500,
    employeeRate: 0.0595,
    employerRate: 0.0595,
    maxContribution: 4034.10,
  },
  // EI (Employment Insurance)
  ei: {
    maxInsurableEarnings: 65700,
    employeeRate: 0.0163,
    employerRate: 0.02282, // 1.4x employee rate
    maxEmployeeContribution: 1071.51,
  },
  // Federal Tax Brackets 2026
  federal: {
    brackets: [
      { min: 0, max: 55867, rate: 0.15 },
      { min: 55867, max: 111733, rate: 0.205 },
      { min: 111733, max: 173205, rate: 0.26 },
      { min: 173205, max: 246752, rate: 0.29 },
      { min: 246752, max: Infinity, rate: 0.33 },
    ],
    basicPersonalAmount: 15705,
  },
  // Ontario Provincial Tax Brackets 2026 (default)
  ontario: {
    brackets: [
      { min: 0, max: 51446, rate: 0.0505 },
      { min: 51446, max: 102894, rate: 0.0915 },
      { min: 102894, max: 150000, rate: 0.1116 },
      { min: 150000, max: 220000, rate: 0.1216 },
      { min: 220000, max: Infinity, rate: 0.1316 },
    ],
    basicPersonalAmount: 11865,
  },
};

export type PayPeriod = "weekly" | "bi-weekly" | "semi-monthly" | "monthly";
export type PayRunStatus = "draft" | "processing" | "approved" | "paid";
export type Province = "ON" | "BC" | "AB" | "QC" | "MB" | "SK" | "NS" | "NB" | "NL" | "PE" | "NT" | "NU" | "YT";

export interface EmployeeCompensation {
  employeeId: string;
  employeeName: string;
  department: string;
  payType: "salary" | "hourly";
  annualSalary?: number;
  hourlyRate?: number;
  hoursPerWeek: number;
  province: Province;
  federalTd1Claim: number;
  provincialTd1Claim: number;
  additionalTax: number;
  bankAccount?: string;
  bankTransit?: string;
  bankInstitution?: string;
}

export interface PayStub {
  id: string;
  employeeId: string;
  employeeName: string;
  payRunId: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  
  // Earnings
  regularHours: number;
  regularRate: number;
  regularPay: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  bonus: number;
  commission: number;
  vacation: number;
  grossPay: number;
  
  // Deductions
  federalTax: number;
  provincialTax: number;
  cpp: number;
  ei: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Net
  netPay: number;
  
  // YTD
  ytdGross: number;
  ytdFederalTax: number;
  ytdProvincialTax: number;
  ytdCpp: number;
  ytdEi: number;
  ytdNet: number;
}

export interface PayRun {
  id: string;
  orgId: string;
  name: string;
  payPeriod: PayPeriod;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  status: PayRunStatus;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalEmployerCost: number; // Includes employer CPP, EI
  payStubs: PayStub[];
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
}

interface PayrollState {
  compensations: EmployeeCompensation[];
  payRuns: PayRun[];
  currentPayRun: PayRun | null;
  loading: boolean;
  
  // Actions
  setCompensation: (comp: EmployeeCompensation) => void;
  createPayRun: (payRun: Omit<PayRun, "id" | "payStubs" | "createdAt">) => PayRun;
  calculatePayStub: (employeeId: string, payRun: PayRun) => PayStub;
  approvePayRun: (payRunId: string) => void;
  markAsPaid: (payRunId: string) => void;
  getYtdTotals: (employeeId: string) => { gross: number; federal: number; provincial: number; cpp: number; ei: number; net: number };
}

// Tax calculation helpers
function calculateFederalTax(annualIncome: number): number {
  const { brackets, basicPersonalAmount } = TAX_CONSTANTS_2026.federal;
  const taxableIncome = Math.max(0, annualIncome - basicPersonalAmount);
  
  let tax = 0;
  let remaining = taxableIncome;
  
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }
  
  return tax;
}

function calculateProvincialTax(annualIncome: number, province: Province): number {
  // Using Ontario as default, would expand for other provinces
  const { brackets, basicPersonalAmount } = TAX_CONSTANTS_2026.ontario;
  const taxableIncome = Math.max(0, annualIncome - basicPersonalAmount);
  
  let tax = 0;
  let remaining = taxableIncome;
  
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }
  
  return tax;
}

function calculateCpp(annualIncome: number, ytdCpp: number): number {
  const { maxPensionableEarnings, basicExemption, employeeRate, maxContribution } = TAX_CONSTANTS_2026.cpp;
  
  if (ytdCpp >= maxContribution) return 0;
  
  const pensionableEarnings = Math.min(annualIncome, maxPensionableEarnings) - basicExemption;
  const annualCpp = Math.max(0, pensionableEarnings * employeeRate);
  const remainingCpp = maxContribution - ytdCpp;
  
  return Math.min(annualCpp / 12, remainingCpp); // Monthly
}

function calculateEi(annualIncome: number, ytdEi: number): number {
  const { maxInsurableEarnings, employeeRate, maxEmployeeContribution } = TAX_CONSTANTS_2026.ei;
  
  if (ytdEi >= maxEmployeeContribution) return 0;
  
  const insuredEarnings = Math.min(annualIncome, maxInsurableEarnings);
  const annualEi = insuredEarnings * employeeRate;
  const remainingEi = maxEmployeeContribution - ytdEi;
  
  return Math.min(annualEi / 12, remainingEi); // Monthly
}

// Mock data
const mockCompensations: EmployeeCompensation[] = [
  {
    employeeId: "e1", employeeName: "Alexandra Mitchell", department: "Management",
    payType: "salary", annualSalary: 185000, hoursPerWeek: 40,
    province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0,
  },
  {
    employeeId: "e2", employeeName: "Jordan Kimura", department: "Engineering",
    payType: "salary", annualSalary: 145000, hoursPerWeek: 40,
    province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0,
  },
  {
    employeeId: "e3", employeeName: "Sam Torres", department: "Engineering",
    payType: "salary", annualSalary: 105000, hoursPerWeek: 40,
    province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0,
  },
  {
    employeeId: "e4", employeeName: "Priya Sharma", department: "Engineering",
    payType: "salary", annualSalary: 92000, hoursPerWeek: 40,
    province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0,
  },
  {
    employeeId: "e5", employeeName: "Marcus Williams", department: "Sales",
    payType: "salary", annualSalary: 125000, hoursPerWeek: 40,
    province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0,
  },
  {
    employeeId: "e7", employeeName: "David Park", department: "Support",
    payType: "salary", annualSalary: 85000, hoursPerWeek: 40,
    province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0,
  },
  {
    employeeId: "e8", employeeName: "Lisa Nguyen", department: "Support",
    payType: "hourly", hourlyRate: 32, hoursPerWeek: 40,
    province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0,
  },
  {
    employeeId: "e9", employeeName: "Ryan Foster", department: "Engineering",
    payType: "salary", annualSalary: 98000, hoursPerWeek: 40,
    province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0,
  },
  {
    employeeId: "e10", employeeName: "Karen Webb", department: "Management",
    payType: "salary", annualSalary: 115000, hoursPerWeek: 40,
    province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0,
  },
];

const mockPayRuns: PayRun[] = [
  {
    id: "pr1", orgId: "org1", name: "January 2026 - Period 1",
    payPeriod: "semi-monthly", periodStart: "2026-01-01", periodEnd: "2026-01-15",
    payDate: "2026-01-20", status: "paid", employeeCount: 9,
    totalGross: 46250, totalDeductions: 14650, totalNet: 31600, totalEmployerCost: 49875,
    payStubs: [], createdAt: "2026-01-16T10:00:00Z", approvedAt: "2026-01-17T14:00:00Z", paidAt: "2026-01-20T09:00:00Z",
  },
  {
    id: "pr2", orgId: "org1", name: "January 2026 - Period 2",
    payPeriod: "semi-monthly", periodStart: "2026-01-16", periodEnd: "2026-01-31",
    payDate: "2026-02-05", status: "paid", employeeCount: 9,
    totalGross: 46250, totalDeductions: 14650, totalNet: 31600, totalEmployerCost: 49875,
    payStubs: [], createdAt: "2026-02-01T10:00:00Z", approvedAt: "2026-02-02T14:00:00Z", paidAt: "2026-02-05T09:00:00Z",
  },
  {
    id: "pr3", orgId: "org1", name: "February 2026 - Period 1",
    payPeriod: "semi-monthly", periodStart: "2026-02-01", periodEnd: "2026-02-15",
    payDate: "2026-02-20", status: "approved", employeeCount: 9,
    totalGross: 46250, totalDeductions: 14650, totalNet: 31600, totalEmployerCost: 49875,
    payStubs: [], createdAt: "2026-02-16T10:00:00Z", approvedAt: "2026-02-17T14:00:00Z",
  },
];

export const usePayrollStore = create<PayrollState>((set, get) => ({
  compensations: mockCompensations,
  payRuns: mockPayRuns,
  currentPayRun: null,
  loading: false,

  setCompensation: (comp) =>
    set((state) => ({
      compensations: state.compensations.some((c) => c.employeeId === comp.employeeId)
        ? state.compensations.map((c) => (c.employeeId === comp.employeeId ? comp : c))
        : [...state.compensations, comp],
    })),

  createPayRun: (payRunData) => {
    const id = `pr${Date.now()}`;
    const { compensations } = get();
    
    // Generate pay stubs for all active employees
    const payStubs: PayStub[] = compensations.map((comp) => {
      const ytd = get().getYtdTotals(comp.employeeId);
      const annualSalary = comp.payType === "salary" 
        ? comp.annualSalary! 
        : comp.hourlyRate! * comp.hoursPerWeek * 52;
      
      const periodsPerYear = payRunData.payPeriod === "monthly" ? 12 
        : payRunData.payPeriod === "semi-monthly" ? 24 
        : payRunData.payPeriod === "bi-weekly" ? 26 : 52;
      
      const grossPay = annualSalary / periodsPerYear;
      const federalTax = calculateFederalTax(annualSalary) / periodsPerYear;
      const provincialTax = calculateProvincialTax(annualSalary, comp.province) / periodsPerYear;
      const cpp = calculateCpp(annualSalary, ytd.cpp);
      const ei = calculateEi(annualSalary, ytd.ei);
      
      const totalDeductions = federalTax + provincialTax + cpp + ei;
      const netPay = grossPay - totalDeductions;
      
      return {
        id: `ps${Date.now()}-${comp.employeeId}`,
        employeeId: comp.employeeId,
        employeeName: comp.employeeName,
        payRunId: id,
        periodStart: payRunData.periodStart,
        periodEnd: payRunData.periodEnd,
        payDate: payRunData.payDate,
        regularHours: comp.hoursPerWeek * 2, // Semi-monthly
        regularRate: comp.payType === "hourly" ? comp.hourlyRate! : annualSalary / 2080,
        regularPay: grossPay,
        overtimeHours: 0,
        overtimeRate: 0,
        overtimePay: 0,
        bonus: 0,
        commission: 0,
        vacation: 0,
        grossPay,
        federalTax,
        provincialTax,
        cpp,
        ei,
        otherDeductions: 0,
        totalDeductions,
        netPay,
        ytdGross: ytd.gross + grossPay,
        ytdFederalTax: ytd.federal + federalTax,
        ytdProvincialTax: ytd.provincial + provincialTax,
        ytdCpp: ytd.cpp + cpp,
        ytdEi: ytd.ei + ei,
        ytdNet: ytd.net + netPay,
      };
    });
    
    const newPayRun: PayRun = {
      ...payRunData,
      id,
      payStubs,
      totalGross: payStubs.reduce((sum, ps) => sum + ps.grossPay, 0),
      totalDeductions: payStubs.reduce((sum, ps) => sum + ps.totalDeductions, 0),
      totalNet: payStubs.reduce((sum, ps) => sum + ps.netPay, 0),
      totalEmployerCost: payStubs.reduce((sum, ps) => sum + ps.grossPay + ps.cpp + (ps.ei * 1.4), 0),
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({ payRuns: [newPayRun, ...state.payRuns], currentPayRun: newPayRun }));
    return newPayRun;
  },

  calculatePayStub: (employeeId, payRun) => {
    const { compensations } = get();
    const comp = compensations.find((c) => c.employeeId === employeeId);
    if (!comp) throw new Error("Employee compensation not found");
    
    const ytd = get().getYtdTotals(employeeId);
    const annualSalary = comp.payType === "salary" 
      ? comp.annualSalary! 
      : comp.hourlyRate! * comp.hoursPerWeek * 52;
    
    const periodsPerYear = payRun.payPeriod === "monthly" ? 12 
      : payRun.payPeriod === "semi-monthly" ? 24 
      : payRun.payPeriod === "bi-weekly" ? 26 : 52;
    
    const grossPay = annualSalary / periodsPerYear;
    const federalTax = calculateFederalTax(annualSalary) / periodsPerYear;
    const provincialTax = calculateProvincialTax(annualSalary, comp.province) / periodsPerYear;
    const cpp = calculateCpp(annualSalary, ytd.cpp);
    const ei = calculateEi(annualSalary, ytd.ei);
    
    const totalDeductions = federalTax + provincialTax + cpp + ei;
    const netPay = grossPay - totalDeductions;
    
    return {
      id: `ps${Date.now()}-${employeeId}`,
      employeeId,
      employeeName: comp.employeeName,
      payRunId: payRun.id,
      periodStart: payRun.periodStart,
      periodEnd: payRun.periodEnd,
      payDate: payRun.payDate,
      regularHours: comp.hoursPerWeek * 2,
      regularRate: comp.payType === "hourly" ? comp.hourlyRate! : annualSalary / 2080,
      regularPay: grossPay,
      overtimeHours: 0,
      overtimeRate: 0,
      overtimePay: 0,
      bonus: 0,
      commission: 0,
      vacation: 0,
      grossPay,
      federalTax,
      provincialTax,
      cpp,
      ei,
      otherDeductions: 0,
      totalDeductions,
      netPay,
      ytdGross: ytd.gross + grossPay,
      ytdFederalTax: ytd.federal + federalTax,
      ytdProvincialTax: ytd.provincial + provincialTax,
      ytdCpp: ytd.cpp + cpp,
      ytdEi: ytd.ei + ei,
      ytdNet: ytd.net + netPay,
    };
  },

  approvePayRun: (payRunId) =>
    set((state) => ({
      payRuns: state.payRuns.map((pr) =>
        pr.id === payRunId ? { ...pr, status: "approved" as const, approvedAt: new Date().toISOString() } : pr
      ),
    })),

  markAsPaid: (payRunId) =>
    set((state) => ({
      payRuns: state.payRuns.map((pr) =>
        pr.id === payRunId ? { ...pr, status: "paid" as const, paidAt: new Date().toISOString() } : pr
      ),
    })),

  getYtdTotals: (employeeId) => {
    const { payRuns } = get();
    const currentYear = new Date().getFullYear();
    
    const ytdPayStubs = payRuns
      .filter((pr) => pr.status === "paid" && new Date(pr.periodEnd).getFullYear() === currentYear)
      .flatMap((pr) => pr.payStubs)
      .filter((ps) => ps.employeeId === employeeId);
    
    return {
      gross: ytdPayStubs.reduce((sum, ps) => sum + ps.grossPay, 0),
      federal: ytdPayStubs.reduce((sum, ps) => sum + ps.federalTax, 0),
      provincial: ytdPayStubs.reduce((sum, ps) => sum + ps.provincialTax, 0),
      cpp: ytdPayStubs.reduce((sum, ps) => sum + ps.cpp, 0),
      ei: ytdPayStubs.reduce((sum, ps) => sum + ps.ei, 0),
      net: ytdPayStubs.reduce((sum, ps) => sum + ps.netPay, 0),
    };
  },
}));
