import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

// 2026 Canadian Tax Constants
const TAX_CONSTANTS_2026 = {
  cpp: {
    maxPensionableEarnings: 71300,
    basicExemption: 3500,
    employeeRate: 0.0595,
    employerRate: 0.0595,
    maxContribution: 4034.10,
  },
  ei: {
    maxInsurableEarnings: 65700,
    employeeRate: 0.0163,
    employerRate: 0.02282,
    maxEmployeeContribution: 1071.51,
  },
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
  federalTax: number;
  provincialTax: number;
  cpp: number;
  ei: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
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
  totalEmployerCost: number;
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
  error: string | null;
  
  // Async actions
  fetchPayRuns: (orgId: string) => Promise<void>;
  createPayRun: (payRun: Omit<PayRun, "id" | "payStubs" | "createdAt">) => Promise<PayRun>;
  approvePayRun: (payRunId: string) => Promise<void>;
  markAsPaid: (payRunId: string) => Promise<void>;
  
  // Sync helpers
  setCompensation: (comp: EmployeeCompensation) => void;
  calculatePayStub: (employeeId: string, payRun: PayRun) => PayStub;
  getYtdTotals: (employeeId: string) => { gross: number; federal: number; provincial: number; cpp: number; ei: number; net: number };
}

// Tax helpers
function calculateFederalTax(annualIncome: number): number {
  const { brackets, basicPersonalAmount } = TAX_CONSTANTS_2026.federal;
  const taxableIncome = Math.max(0, annualIncome - basicPersonalAmount);
  let tax = 0, remaining = taxableIncome;
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }
  return tax;
}

function calculateProvincialTax(annualIncome: number, _province: Province): number {
  const { brackets, basicPersonalAmount } = TAX_CONSTANTS_2026.ontario;
  const taxableIncome = Math.max(0, annualIncome - basicPersonalAmount);
  let tax = 0, remaining = taxableIncome;
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
  return Math.min(annualCpp / 12, maxContribution - ytdCpp);
}

function calculateEi(annualIncome: number, ytdEi: number): number {
  const { maxInsurableEarnings, employeeRate, maxEmployeeContribution } = TAX_CONSTANTS_2026.ei;
  if (ytdEi >= maxEmployeeContribution) return 0;
  const insuredEarnings = Math.min(annualIncome, maxInsurableEarnings);
  const annualEi = insuredEarnings * employeeRate;
  return Math.min(annualEi / 12, maxEmployeeContribution - ytdEi);
}

// Demo org UUID - used when no real org is configured
const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

// Mock data for demo mode
const mockCompensations: EmployeeCompensation[] = [
  { employeeId: "e1", employeeName: "Alexandra Mitchell", department: "Management", payType: "salary", annualSalary: 185000, hoursPerWeek: 40, province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0 },
  { employeeId: "e2", employeeName: "Jordan Kimura", department: "Engineering", payType: "salary", annualSalary: 145000, hoursPerWeek: 40, province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0 },
  { employeeId: "e3", employeeName: "Sam Torres", department: "Engineering", payType: "salary", annualSalary: 105000, hoursPerWeek: 40, province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0 },
  { employeeId: "e4", employeeName: "Priya Sharma", department: "Engineering", payType: "salary", annualSalary: 92000, hoursPerWeek: 40, province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0 },
  { employeeId: "e5", employeeName: "Marcus Williams", department: "Sales", payType: "salary", annualSalary: 125000, hoursPerWeek: 40, province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0 },
  { employeeId: "e7", employeeName: "David Park", department: "Support", payType: "salary", annualSalary: 85000, hoursPerWeek: 40, province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0 },
  { employeeId: "e8", employeeName: "Lisa Nguyen", department: "Support", payType: "hourly", hourlyRate: 32, hoursPerWeek: 40, province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0 },
  { employeeId: "e9", employeeName: "Ryan Foster", department: "Engineering", payType: "salary", annualSalary: 98000, hoursPerWeek: 40, province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0 },
  { employeeId: "e10", employeeName: "Karen Webb", department: "Management", payType: "salary", annualSalary: 115000, hoursPerWeek: 40, province: "ON", federalTd1Claim: 15705, provincialTd1Claim: 11865, additionalTax: 0 },
];

function generateMockPayStubs(payRun: Pick<PayRun, "id" | "payPeriod" | "periodStart" | "periodEnd" | "payDate">, compensations: EmployeeCompensation[]): PayStub[] {
  return compensations.map((comp, idx) => {
    const annualSalary = comp.payType === "salary" ? comp.annualSalary! : comp.hourlyRate! * comp.hoursPerWeek * 52;
    const periodsPerYear = payRun.payPeriod === "monthly" ? 12 : payRun.payPeriod === "semi-monthly" ? 24 : payRun.payPeriod === "bi-weekly" ? 26 : 52;
    const grossPay = annualSalary / periodsPerYear;
    const federalTax = calculateFederalTax(annualSalary) / periodsPerYear;
    const provincialTax = calculateProvincialTax(annualSalary, comp.province) / periodsPerYear;
    const cpp = calculateCpp(annualSalary, 0);
    const ei = calculateEi(annualSalary, 0);
    const totalDeductions = federalTax + provincialTax + cpp + ei;
    const netPay = grossPay - totalDeductions;
    
    return {
      id: `ps-${payRun.id}-${idx}`,
      employeeId: comp.employeeId,
      employeeName: comp.employeeName,
      payRunId: payRun.id,
      periodStart: payRun.periodStart,
      periodEnd: payRun.periodEnd,
      payDate: payRun.payDate,
      regularHours: comp.hoursPerWeek * 2,
      regularRate: comp.payType === "hourly" ? comp.hourlyRate! : annualSalary / 2080,
      regularPay: grossPay,
      overtimeHours: 0, overtimeRate: 0, overtimePay: 0,
      bonus: 0, commission: 0, vacation: 0,
      grossPay, federalTax, provincialTax, cpp, ei,
      otherDeductions: 0, totalDeductions, netPay,
      ytdGross: grossPay * 2, ytdFederalTax: federalTax * 2, ytdProvincialTax: provincialTax * 2,
      ytdCpp: cpp * 2, ytdEi: ei * 2, ytdNet: netPay * 2,
    };
  });
}

const mockPayRunsData = [
  { id: "pr1", orgId: DEMO_ORG_ID, name: "January 2026 - Period 1", payPeriod: "semi-monthly" as PayPeriod, periodStart: "2026-01-01", periodEnd: "2026-01-15", payDate: "2026-01-20", status: "paid" as PayRunStatus, employeeCount: 9, totalGross: 46250, totalDeductions: 14650, totalNet: 31600, totalEmployerCost: 49875, payStubs: [] as PayStub[], createdAt: "2026-01-16T10:00:00Z", approvedAt: "2026-01-17T14:00:00Z", paidAt: "2026-01-20T09:00:00Z" },
  { id: "pr2", orgId: DEMO_ORG_ID, name: "January 2026 - Period 2", payPeriod: "semi-monthly" as PayPeriod, periodStart: "2026-01-16", periodEnd: "2026-01-31", payDate: "2026-02-05", status: "paid" as PayRunStatus, employeeCount: 9, totalGross: 46250, totalDeductions: 14650, totalNet: 31600, totalEmployerCost: 49875, payStubs: [] as PayStub[], createdAt: "2026-02-01T10:00:00Z", approvedAt: "2026-02-02T14:00:00Z", paidAt: "2026-02-05T09:00:00Z" },
  { id: "pr3", orgId: DEMO_ORG_ID, name: "February 2026 - Period 1", payPeriod: "semi-monthly" as PayPeriod, periodStart: "2026-02-01", periodEnd: "2026-02-15", payDate: "2026-02-20", status: "approved" as PayRunStatus, employeeCount: 9, totalGross: 46250, totalDeductions: 14650, totalNet: 31600, totalEmployerCost: 49875, payStubs: [] as PayStub[], createdAt: "2026-02-16T10:00:00Z", approvedAt: "2026-02-17T14:00:00Z" },
];
const mockPayRuns: PayRun[] = mockPayRunsData.map(pr => ({ ...pr, payStubs: generateMockPayStubs(pr, mockCompensations) }));

const isSupabaseConfigured = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Helper to convert snake_case DB rows to camelCase
function mapPayRunFromDb(row: Record<string, unknown>, stubs: PayStub[] = []): PayRun {
  return {
    id: row.id as string,
    orgId: row.org_id as string,
    name: row.name as string,
    payPeriod: row.pay_period as PayPeriod,
    periodStart: row.period_start as string,
    periodEnd: row.period_end as string,
    payDate: row.pay_date as string,
    status: row.status as PayRunStatus,
    employeeCount: row.employee_count as number,
    totalGross: Number(row.total_gross),
    totalDeductions: Number(row.total_deductions),
    totalNet: Number(row.total_net),
    totalEmployerCost: Number(row.total_employer_cost),
    payStubs: stubs,
    createdAt: row.created_at as string,
    approvedAt: row.approved_at as string | undefined,
    paidAt: row.paid_at as string | undefined,
  };
}

function mapPayStubFromDb(row: Record<string, unknown>): PayStub {
  return {
    id: row.id as string,
    employeeId: row.employee_id as string,
    employeeName: (row as Record<string, unknown>).employee_name as string || "Employee",
    payRunId: row.pay_run_id as string,
    periodStart: row.period_start as string,
    periodEnd: row.period_end as string,
    payDate: row.pay_date as string,
    regularHours: Number(row.regular_hours),
    regularRate: Number(row.regular_rate),
    regularPay: Number(row.regular_pay),
    overtimeHours: Number(row.overtime_hours),
    overtimeRate: Number(row.overtime_rate),
    overtimePay: Number(row.overtime_pay),
    bonus: Number(row.bonus),
    commission: Number(row.commission),
    vacation: Number(row.vacation_pay),
    grossPay: Number(row.gross_pay),
    federalTax: Number(row.federal_tax),
    provincialTax: Number(row.provincial_tax),
    cpp: Number(row.cpp),
    ei: Number(row.ei),
    otherDeductions: Number(row.other_deductions),
    totalDeductions: Number(row.total_deductions),
    netPay: Number(row.net_pay),
    ytdGross: Number(row.ytd_gross),
    ytdFederalTax: Number(row.ytd_federal_tax),
    ytdProvincialTax: Number(row.ytd_provincial_tax),
    ytdCpp: Number(row.ytd_cpp),
    ytdEi: Number(row.ytd_ei),
    ytdNet: Number(row.ytd_net),
  };
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  compensations: mockCompensations,
  payRuns: [],
  currentPayRun: null,
  loading: false,
  error: null,

  fetchPayRuns: async (orgId: string) => {
    if (!isSupabaseConfigured()) {
      set({ payRuns: mockPayRuns, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      
      // Fetch pay runs
      const { data: runsData, error: runsError } = await supabase
        .from("pay_runs")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      if (runsError) throw runsError;
      if (!runsData || runsData.length === 0) {
        set({ payRuns: mockPayRuns, loading: false });
        return;
      }

      // Fetch all pay stubs for these runs
      const runIds = runsData.map((r: { id: string }) => r.id);
      const { data: stubsData, error: stubsError } = await supabase
        .from("pay_stubs")
        .select("*, employees(name)")
        .in("pay_run_id", runIds);

      if (stubsError) throw stubsError;

      // Group stubs by pay_run_id
      const stubsByRun: Record<string, PayStub[]> = {};
      (stubsData || []).forEach((stub: Record<string, unknown>) => {
        const runId = stub.pay_run_id as string;
        if (!stubsByRun[runId]) stubsByRun[runId] = [];
        const mapped = mapPayStubFromDb(stub);
        // Get employee name from join
        if (stub.employees && typeof stub.employees === 'object') {
          mapped.employeeName = (stub.employees as { name: string }).name;
        }
        stubsByRun[runId].push(mapped);
      });

      const payRuns = runsData.map((row: Record<string, unknown>) => mapPayRunFromDb(row, stubsByRun[row.id as string] || []));
      set({ payRuns, loading: false });
    } catch (err) {
      console.error("fetchPayRuns error:", err);
      set({ payRuns: mockPayRuns, loading: false, error: String(err) });
    }
  },

  createPayRun: async (payRunData) => {
    const { compensations } = get();
    const id = crypto.randomUUID();
    
    // Generate pay stubs
    const payStubs = generateMockPayStubs({ ...payRunData, id }, compensations);
    
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

    // Update local state immediately
    set((state) => ({ payRuns: [newPayRun, ...state.payRuns], currentPayRun: newPayRun }));

    // Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        
        // Insert pay run
        const { error: runError } = await supabase.from("pay_runs").insert({
          id: newPayRun.id,
          org_id: newPayRun.orgId,
          name: newPayRun.name,
          pay_period: newPayRun.payPeriod,
          period_start: newPayRun.periodStart,
          period_end: newPayRun.periodEnd,
          pay_date: newPayRun.payDate,
          status: newPayRun.status,
          employee_count: newPayRun.employeeCount,
          total_gross: newPayRun.totalGross,
          total_deductions: newPayRun.totalDeductions,
          total_net: newPayRun.totalNet,
          total_employer_cost: newPayRun.totalEmployerCost,
        });
        if (runError) console.error("Error saving pay run:", runError);

        // Insert pay stubs
        const stubInserts = payStubs.map((ps) => ({
          id: ps.id,
          pay_run_id: ps.payRunId,
          employee_id: ps.employeeId,
          period_start: ps.periodStart,
          period_end: ps.periodEnd,
          pay_date: ps.payDate,
          regular_hours: ps.regularHours,
          regular_rate: ps.regularRate,
          regular_pay: ps.regularPay,
          overtime_hours: ps.overtimeHours,
          overtime_rate: ps.overtimeRate,
          overtime_pay: ps.overtimePay,
          bonus: ps.bonus,
          commission: ps.commission,
          vacation_pay: ps.vacation,
          gross_pay: ps.grossPay,
          federal_tax: ps.federalTax,
          provincial_tax: ps.provincialTax,
          cpp: ps.cpp,
          ei: ps.ei,
          other_deductions: ps.otherDeductions,
          total_deductions: ps.totalDeductions,
          net_pay: ps.netPay,
          ytd_gross: ps.ytdGross,
          ytd_federal_tax: ps.ytdFederalTax,
          ytd_provincial_tax: ps.ytdProvincialTax,
          ytd_cpp: ps.ytdCpp,
          ytd_ei: ps.ytdEi,
          ytd_net: ps.ytdNet,
        }));
        
        const { error: stubsError } = await supabase.from("pay_stubs").insert(stubInserts);
        if (stubsError) console.error("Error saving pay stubs:", stubsError);
      } catch (err) {
        console.error("createPayRun save error:", err);
      }
    }

    return newPayRun;
  },

  approvePayRun: async (payRunId: string) => {
    const approvedAt = new Date().toISOString();
    
    set((state) => ({
      payRuns: state.payRuns.map((pr) =>
        pr.id === payRunId ? { ...pr, status: "approved" as const, approvedAt } : pr
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from("pay_runs").update({ status: "approved", approved_at: approvedAt }).eq("id", payRunId);
      } catch (err) {
        console.error("approvePayRun error:", err);
      }
    }
  },

  markAsPaid: async (payRunId: string) => {
    const paidAt = new Date().toISOString();
    
    set((state) => ({
      payRuns: state.payRuns.map((pr) =>
        pr.id === payRunId ? { ...pr, status: "paid" as const, paidAt } : pr
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from("pay_runs").update({ status: "paid", paid_at: paidAt }).eq("id", payRunId);
      } catch (err) {
        console.error("markAsPaid error:", err);
      }
    }
  },

  setCompensation: (comp) =>
    set((state) => ({
      compensations: state.compensations.some((c) => c.employeeId === comp.employeeId)
        ? state.compensations.map((c) => (c.employeeId === comp.employeeId ? comp : c))
        : [...state.compensations, comp],
    })),

  calculatePayStub: (employeeId, payRun) => {
    const { compensations } = get();
    const comp = compensations.find((c) => c.employeeId === employeeId);
    if (!comp) throw new Error("Employee compensation not found");
    
    const ytd = get().getYtdTotals(employeeId);
    const annualSalary = comp.payType === "salary" ? comp.annualSalary! : comp.hourlyRate! * comp.hoursPerWeek * 52;
    const periodsPerYear = payRun.payPeriod === "monthly" ? 12 : payRun.payPeriod === "semi-monthly" ? 24 : payRun.payPeriod === "bi-weekly" ? 26 : 52;
    
    const grossPay = annualSalary / periodsPerYear;
    const federalTax = calculateFederalTax(annualSalary) / periodsPerYear;
    const provincialTax = calculateProvincialTax(annualSalary, comp.province) / periodsPerYear;
    const cpp = calculateCpp(annualSalary, ytd.cpp);
    const ei = calculateEi(annualSalary, ytd.ei);
    const totalDeductions = federalTax + provincialTax + cpp + ei;
    const netPay = grossPay - totalDeductions;
    
    return {
      id: crypto.randomUUID(),
      employeeId,
      employeeName: comp.employeeName,
      payRunId: payRun.id,
      periodStart: payRun.periodStart,
      periodEnd: payRun.periodEnd,
      payDate: payRun.payDate,
      regularHours: comp.hoursPerWeek * 2,
      regularRate: comp.payType === "hourly" ? comp.hourlyRate! : annualSalary / 2080,
      regularPay: grossPay,
      overtimeHours: 0, overtimeRate: 0, overtimePay: 0,
      bonus: 0, commission: 0, vacation: 0,
      grossPay, federalTax, provincialTax, cpp, ei,
      otherDeductions: 0, totalDeductions, netPay,
      ytdGross: ytd.gross + grossPay,
      ytdFederalTax: ytd.federal + federalTax,
      ytdProvincialTax: ytd.provincial + provincialTax,
      ytdCpp: ytd.cpp + cpp,
      ytdEi: ytd.ei + ei,
      ytdNet: ytd.net + netPay,
    };
  },

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
