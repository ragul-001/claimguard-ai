export type InsuranceCompany = 
  | "LIC"
  | "HDFC Ergo"
  | "Muthoot Health Insurance"
  | "Star Health Insurance"
  | "ICICI Lombard"
  | null;

export interface InsuranceDetectionResult {
  company: InsuranceCompany;
  isValid: boolean;
  errorMessage?: string;
}

export const detectInsuranceCompany = (policyNumber: string): InsuranceDetectionResult => {
  if (!policyNumber || policyNumber.trim() === "") {
    return {
      company: null,
      isValid: false,
    };
  }

  const trimmedPolicy = policyNumber.trim();

  // LIC: exactly 9 digits, numeric only
  if (/^\d{9}$/.test(trimmedPolicy)) {
    return {
      company: "LIC",
      isValid: true,
    };
  }

  // HDFC Ergo: exactly 10 digits, numeric only
  if (/^\d{10}$/.test(trimmedPolicy)) {
    return {
      company: "HDFC Ergo",
      isValid: true,
    };
  }

  // Muthoot Health Insurance: PREFIX-YEAR-6DIGITS (e.g., MHI-2025-009876)
  if (/^[A-Za-z]+-\d{4}-\d{6}$/.test(trimmedPolicy)) {
    return {
      company: "Muthoot Health Insurance",
      isValid: true,
    };
  }

  // Star Health Insurance: Letter prefix / fields / digits (e.g., P/141113/01/2025/012345)
  // Pattern: starts with letter(s), has slashes, ends with digits
  if (/^[A-Za-z]+\/[\w\/]+\/\d+$/.test(trimmedPolicy)) {
    return {
      company: "Star Health Insurance",
      isValid: true,
    };
  }

  // ICICI Lombard: 11+ characters, alphanumeric, must have at least one letter and one digit
  if (
    trimmedPolicy.length >= 11 &&
    /^[A-Za-z0-9]+$/.test(trimmedPolicy) &&
    /[A-Za-z]/.test(trimmedPolicy) &&
    /\d/.test(trimmedPolicy)
  ) {
    return {
      company: "ICICI Lombard",
      isValid: true,
    };
  }

  // If none of the patterns match
  return {
    company: null,
    isValid: false,
    errorMessage: "Invalid policy number format.",
  };
};
