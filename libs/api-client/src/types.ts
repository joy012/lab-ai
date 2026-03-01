export interface SDKError {
  status: number;
  message: string;
  body?: unknown;
}

export type SDKResult<T> =
  | { data: T; error: null }
  | { data: null; error: SDKError };

export type RequestFn = <T>(
  method: string,
  path: string,
  options?: {
    params?: Record<string, string>;
    query?: Record<string, unknown>;
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    contentType?: string;
  },
) => Promise<SDKResult<T>>;

export interface ClientConfig {
  baseUrl: string;
  headers?: Record<string, string> | (() => Promise<Record<string, string>>);
  onRequest?: (
    url: string,
    init: RequestInit,
  ) => RequestInit | Promise<RequestInit>;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role?: 'PATIENT' | 'DOCTOR';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: string;
  emailVerified: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  healthProfile?: HealthProfileResponse | null;
}

export interface HealthProfileResponse {
  id: string;
  userId: string;
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  height?: number | null;
  bloodGroup?: string | null;
  conditions: string[];
  medications: string[];
  allergies: string[];
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

export interface UpdateHealthProfileRequest {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  bloodGroup?: string;
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
}

// Lab Report types
export type ReportType = 'LAB_REPORT' | 'ECG' | 'IMAGING';

export interface LabValue {
  test: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "critical";
}

export interface ECGFinding {
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'critical';
}

export interface ImagingFinding {
  location: string;
  description: string;
  significance: 'normal' | 'benign' | 'concerning' | 'critical';
}

export interface LabReportResponse {
  id: string;
  userId: string;
  title?: string | null;
  reportType: ReportType;
  imageUrl: string;
  imageUrls: string[];
  rawText?: string | null;
  values?: LabValue[] | null;
  summary?: string | null;
  summaryBn?: string | null;
  diagnosis?: string[] | null;
  diagnosisBn?: string[] | null;
  diagnosisStatus?: string | null;
  riskScore?: number | null;
  recommendations?: {
    diet: string[];
    lifestyle: string[];
    followUp: string[];
  } | null;
  // ECG-specific
  ecgFindings?: ECGFinding[] | null;
  // Imaging-specific
  imagingModality?: string | null;
  imagingFindings?: ImagingFinding[] | null;
  impression?: string | null;
  impressionBn?: string | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorMessage?: string | null;
  labName?: string | null;
  reportDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TrendAnalysis {
  test: string;
  unit: string;
  dataPoints: { date: string; value: number; status: string }[];
  trend: "improving" | "worsening" | "stable" | "insufficient_data";
  analysis: string;
}

export interface CompareResult {
  comparison: string;
  improvements: string[];
  deteriorations: string[];
  unchanged: string[];
}

export interface MessageResponse {
  message: string;
}
