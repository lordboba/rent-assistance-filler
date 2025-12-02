export interface FormType {
  id: string;
  name: string;
  description: string;
  category: "federal" | "state" | "local" | "general";
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "date" | "select" | "textarea" | "ssn" | "address";
  required: boolean;
  placeholder?: string;
  options?: string[];
  autoFillKey?: string;
}

export const FORM_TYPES: FormType[] = [
  {
    id: "hud-vash",
    name: "HUD-VASH Application",
    description: "Housing and Urban Development - VA Supportive Housing voucher",
    category: "federal",
    fields: [
      { id: "firstName", label: "First Name", type: "text", required: true, autoFillKey: "firstName" },
      { id: "lastName", label: "Last Name", type: "text", required: true, autoFillKey: "lastName" },
      { id: "ssn", label: "Social Security Number", type: "ssn", required: true, autoFillKey: "ssn" },
      { id: "dateOfBirth", label: "Date of Birth", type: "date", required: true, autoFillKey: "dateOfBirth" },
      { id: "phone", label: "Phone Number", type: "phone", required: true, autoFillKey: "phone" },
      { id: "email", label: "Email", type: "email", required: true, autoFillKey: "email" },
      { id: "currentAddress", label: "Current Address", type: "address", required: true, autoFillKey: "address" },
      { id: "militaryBranch", label: "Military Branch", type: "select", required: true, options: ["Army", "Navy", "Air Force", "Marines", "Coast Guard", "Space Force"], autoFillKey: "veteranStatus.branch" },
      { id: "dischargeType", label: "Discharge Type", type: "select", required: true, options: ["Honorable", "General", "Other Than Honorable", "Bad Conduct", "Dishonorable"], autoFillKey: "veteranStatus.dischargeType" },
      { id: "homelessStatus", label: "Current Housing Situation", type: "select", required: true, options: ["Homeless", "At Risk of Homelessness", "In Shelter", "Couch Surfing", "Other"] },
    ],
  },
  {
    id: "ssvf-intake",
    name: "SSVF Intake Form",
    description: "Supportive Services for Veteran Families program intake",
    category: "federal",
    fields: [
      { id: "firstName", label: "First Name", type: "text", required: true, autoFillKey: "firstName" },
      { id: "lastName", label: "Last Name", type: "text", required: true, autoFillKey: "lastName" },
      { id: "ssn", label: "Social Security Number", type: "ssn", required: true, autoFillKey: "ssn" },
      { id: "dateOfBirth", label: "Date of Birth", type: "date", required: true, autoFillKey: "dateOfBirth" },
      { id: "phone", label: "Phone Number", type: "phone", required: true, autoFillKey: "phone" },
      { id: "email", label: "Email", type: "email", required: true, autoFillKey: "email" },
      { id: "householdSize", label: "Household Size", type: "text", required: true },
      { id: "monthlyIncome", label: "Monthly Household Income", type: "text", required: true },
      { id: "currentAddress", label: "Current Address", type: "address", required: false, autoFillKey: "address" },
      { id: "assistanceNeeded", label: "Type of Assistance Needed", type: "select", required: true, options: ["Rental Assistance", "Utility Assistance", "Security Deposit", "Moving Costs", "Other"] },
    ],
  },
  {
    id: "standard-rental",
    name: "Standard Rental Application",
    description: "Generic landlord/property management applications",
    category: "general",
    fields: [
      { id: "firstName", label: "First Name", type: "text", required: true, autoFillKey: "firstName" },
      { id: "lastName", label: "Last Name", type: "text", required: true, autoFillKey: "lastName" },
      { id: "ssn", label: "Social Security Number", type: "ssn", required: true, autoFillKey: "ssn" },
      { id: "dateOfBirth", label: "Date of Birth", type: "date", required: true, autoFillKey: "dateOfBirth" },
      { id: "phone", label: "Phone Number", type: "phone", required: true, autoFillKey: "phone" },
      { id: "email", label: "Email", type: "email", required: true, autoFillKey: "email" },
      { id: "currentAddress", label: "Current Address", type: "address", required: true, autoFillKey: "address" },
      { id: "currentEmployer", label: "Current Employer", type: "text", required: false },
      { id: "monthlyIncome", label: "Monthly Income", type: "text", required: true },
      { id: "previousLandlord", label: "Previous Landlord Name", type: "text", required: false },
      { id: "previousLandlordPhone", label: "Previous Landlord Phone", type: "phone", required: false },
    ],
  },
  {
    id: "income-verification",
    name: "Income Verification Form",
    description: "Proof of income documentation (VA Form 5655)",
    category: "federal",
    fields: [
      { id: "firstName", label: "First Name", type: "text", required: true, autoFillKey: "firstName" },
      { id: "lastName", label: "Last Name", type: "text", required: true, autoFillKey: "lastName" },
      { id: "middleName", label: "Middle Name", type: "text", required: false, autoFillKey: "middleName" },
      { id: "ssn", label: "Social Security Number", type: "ssn", required: true, autoFillKey: "ssn" },
      { id: "vaFileNumber", label: "VA File Number", type: "text", required: false },
      { id: "currentAddress", label: "Current Address", type: "address", required: true, autoFillKey: "address" },
      { id: "phone", label: "Phone Number", type: "phone", required: true, autoFillKey: "phone" },
      { id: "dateOfBirth", label: "Date of Birth", type: "date", required: true, autoFillKey: "dateOfBirth" },
      { id: "spouseName", label: "Name of Spouse", type: "text", required: false },
      { id: "dependentsAges", label: "Ages of Other Dependents", type: "text", required: false },
      { id: "reason", label: "Why are you completing this form?", type: "text", required: false },
      { id: "employmentStatus", label: "Employment Status", type: "select", required: true, options: ["Employed", "Self-Employed", "Unemployed", "Retired", "Disabled"] },
      { id: "monthlyIncome", label: "Monthly Income", type: "text", required: true },
      { id: "incomeSource", label: "Primary Income Source", type: "select", required: true, options: ["Employment", "VA Disability", "Social Security", "Pension", "Other"] },
      { id: "rentOrMortgage", label: "Rent or Mortgage (Monthly)", type: "text", required: false },
      { id: "foodExpenses", label: "Food (Monthly)", type: "text", required: false },
      { id: "utilities", label: "Utilities and Heat (Monthly)", type: "text", required: false },
      { id: "otherLivingExpenses", label: "Other Living Expenses (Monthly)", type: "text", required: false },
      { id: "installmentPayments", label: "Installment/Contract Debts (Monthly)", type: "text", required: false },
      { id: "totalMonthlyExpenses", label: "Total Monthly Expenses", type: "text", required: false },
    ],
  },
  {
    id: "va-benefits-verification",
    name: "VA Benefits Verification",
    description: "Request for VA benefit status confirmation (VA Form 26-8937)",
    category: "federal",
    fields: [
      { id: "firstName", label: "First Name", type: "text", required: true, autoFillKey: "firstName" },
      { id: "lastName", label: "Last Name", type: "text", required: true, autoFillKey: "lastName" },
      { id: "ssn", label: "Social Security Number", type: "ssn", required: true, autoFillKey: "ssn" },
      { id: "dateOfBirth", label: "Date of Birth", type: "date", required: true, autoFillKey: "dateOfBirth" },
      { id: "vaFileNumber", label: "VA File Number", type: "text", required: false },
      { id: "serviceStart", label: "Service Start Date", type: "date", required: true, autoFillKey: "veteranStatus.serviceStart" },
      { id: "serviceEnd", label: "Service End Date", type: "date", required: true, autoFillKey: "veteranStatus.serviceEnd" },
      { id: "militaryBranch", label: "Military Branch", type: "select", required: true, options: ["Army", "Navy", "Air Force", "Marines", "Coast Guard", "Space Force"], autoFillKey: "veteranStatus.branch" },
    ],
  },
  {
    id: "section-8",
    name: "Section 8 Housing Choice Voucher",
    description: "Federal housing assistance program application",
    category: "federal",
    fields: [
      { id: "firstName", label: "First Name", type: "text", required: true, autoFillKey: "firstName" },
      { id: "lastName", label: "Last Name", type: "text", required: true, autoFillKey: "lastName" },
      { id: "ssn", label: "Social Security Number", type: "ssn", required: true, autoFillKey: "ssn" },
      { id: "dateOfBirth", label: "Date of Birth", type: "date", required: true, autoFillKey: "dateOfBirth" },
      { id: "phone", label: "Phone Number", type: "phone", required: true, autoFillKey: "phone" },
      { id: "email", label: "Email", type: "email", required: true, autoFillKey: "email" },
      { id: "currentAddress", label: "Current Address", type: "address", required: true, autoFillKey: "address" },
      { id: "householdSize", label: "Household Size", type: "text", required: true },
      { id: "annualIncome", label: "Annual Household Income", type: "text", required: true },
      { id: "veteranStatus", label: "Veteran Status", type: "select", required: true, options: ["Veteran", "Veteran Spouse", "Not a Veteran"] },
      { id: "disabilityStatus", label: "Disability Status", type: "select", required: false, options: ["Yes", "No"] },
    ],
  },
  {
    id: "landlord-verification",
    name: "Landlord Verification Form",
    description: "Rental history verification for housing programs",
    category: "general",
    fields: [
      { id: "tenantFirstName", label: "Tenant First Name", type: "text", required: true, autoFillKey: "firstName" },
      { id: "tenantLastName", label: "Tenant Last Name", type: "text", required: true, autoFillKey: "lastName" },
      { id: "tenantSSN", label: "Tenant SSN (Last 4)", type: "text", required: true },
      { id: "rentalAddress", label: "Rental Address", type: "address", required: true },
      { id: "moveInDate", label: "Move-In Date", type: "date", required: true },
      { id: "moveOutDate", label: "Move-Out Date", type: "date", required: false },
      { id: "monthlyRent", label: "Monthly Rent Amount", type: "text", required: true },
      { id: "landlordName", label: "Landlord Name", type: "text", required: true },
      { id: "landlordPhone", label: "Landlord Phone", type: "phone", required: true },
    ],
  },
];
