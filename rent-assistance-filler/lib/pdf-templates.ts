import fs from "fs/promises";
import path from "path";
import { PDFDocument, PDFForm } from "pdf-lib";

type FormData = Record<string, string>;

type TemplateConfig = {
  formType: string;
  templatePath: string;
  description: string;
  fill: (form: PDFForm, data: FormData) => void;
};

const templates: Record<string, TemplateConfig> = {
  "section-8": {
    formType: "section-8",
    templatePath: "public/forms/templates/hud-52641-request-for-tenancy-approval.pdf",
    description: "HUD Form 52641 Request for Tenancy Approval",
    fill: (form, data) => {
      const setText = (name: string, value?: string) => {
        if (!value) return;
        try {
          const field = form.getTextField(name);
          field.setText(value);
        } catch {
          // Field not found in this template
        }
      };

      // Best-effort mapping based on available fields in HUD-52641
      const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
      setText("Name", fullName);
      setText("Tenant", fullName);
      setText("Address street_ city_ state_ zip code", data.currentAddress || data.address);
      setText("ContractUnitAddress", data.currentAddress || data.rentalAddress);
      setText("HouseholdMembers", data.householdSize || data.householdMembers);
      setText("Text1", data.email || data.phone);
      setText("Textfield-1", data.phone);
      setText("Textfield-2", data.email);
      setText("Textfield-3", data.monthlyIncome || data.annualIncome);
      setText("Textfield-4", data.assistanceNeeded || data.homelessStatus);
      setText("Textfield-5", data.militaryBranch || data.veteranStatus);
      setText("Textfield-6", data.dischargeType);
      setText("Textfield-10", data.moveInDate);
      setText("Textfield-11", data.moveOutDate);
      setText("Print or Type Name of Owner", data.landlordName || fullName);
      setText("Print or Type Name of PHA", "Local Public Housing Authority");
      setText("Signature", fullName);
      setText("Signature-0", fullName);
      setText("Date mmddyyyy", new Date().toLocaleDateString());
      setText("Date mmddyyyy-0", new Date().toLocaleDateString());
    },
  },
  "va-benefits-verification": {
    formType: "va-benefits-verification",
    templatePath: "public/forms/templates/va-26-8937-benefits-verification.pdf",
    description: "VA Form 26-8937 Verification of VA Benefits",
    fill: (form, data) => {
      const setText = (name: string, value?: string) => {
        if (!value) return;
        try {
          form.getTextField(name).setText(value);
        } catch {
          // ignore missing fields
        }
      };
      const selectRadio = (name: string, value?: string) => {
        if (!value) return;
        try {
          const radio = form.getRadioGroup(name);
          radio.select(value);
        } catch {
          // ignore missing fields
        }
      };
      const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
      setText("form1[0].#subform[0].TO[0]", "Department of Veterans Affairs");
      setText("form1[0].#subform[0].NAMEOFVETERAN[0]", fullName);
      setText("form1[0].#subform[0].CURRENTADDRESSOFVETERAN[0]", data.currentAddress || data.address);
      setText("form1[0].#subform[0].DOB[0]", data.dateOfBirth);
      setText("form1[0].#subform[0].SSN[0]", data.ssn);
      setText("form1[0].#subform[0].VACLAIMNO[0]", data.vaFileNumber || data.veteranFileNumber);
      setText("form1[0].#subform[0].SERVICENUMBER[0]", data.militaryBranch);
      selectRadio("form1[0].#subform[0].RadioButtonList[0]", data.dischargeType);
      setText("form1[0].#subform[0].Signature1[0]", fullName);
      setText("form1[0].#subform[0].DATESIGNED[0]", new Date().toLocaleDateString());
    },
  },
  "income-verification": {
    formType: "income-verification",
    templatePath: "public/forms/templates/va-5655-financial-status-report.pdf",
    description: "VA Form 5655 Financial Status Report",
    fill: (form, data) => {
      const setText = (name: string, value?: string) => {
        if (!value) return;
        try {
          form.getTextField(name).setText(value);
        } catch {
          // field not present
        }
      };

      const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ").trim();

      // Section I – Personal Data
      setText("vaco5655[0].#subform[0].Field1[0]", data.ssn); // Social Security Number
      // Field2 is "File No." and should remain blank unless explicitly provided
      setText("vaco5655[0].#subform[0].Field3[0]", data.reason || data.why || "Waiver"); // Why are you completing this form
      setText("vaco5655[0].#subform[0].Field4[0]", fullName); // First, middle, last name
      setText("vaco5655[0].#subform[0].Field5[0]", data.currentAddress || data.address); // Address
      setText("vaco5655[0].#subform[0].Field6[0]", data.phone); // Telephone
      setText("vaco5655[0].#subform[0].Field7[0]", data.dateOfBirth); // Date of birth
      setText("vaco5655[0].#subform[0].Field9[0]", data.spouseName || data.spouse); // Name of spouse
      setText("vaco5655[0].#subform[0].Field10[0]", data.dependentAges || data.dependentsAges || data.agesOfDependents); // Ages of other dependents

      // Income basics (Section II – Income)
      setText("vaco5655[0].#subform[0].Field11[0]", data.monthlyIncome || data.annualIncome); // Average monthly gross salary/wages
      setText("vaco5655[0].#subform[0].Field12[0]", data.incomeSource || data.employmentStatus); // Primary income source/notes

      // Expenses (Section III – Expenses)
      setText("vaco5655[0].#subform[0].Field46[0]", data.rentOrMortgage); // 18. Rent or mortgage
      setText("vaco5655[0].#subform[0].Field47[0]", data.foodExpenses); // 19. Food
      setText("vaco5655[0].#subform[0].Field48[0]", data.utilities); // 20. Utilities and heat
      setText("vaco5655[0].#subform[0].Field49[0]", data.otherLivingExpenses); // 21. Other living expenses
      setText("vaco5655[0].#subform[0].Field50[0]", data.installmentPayments); // 22. Installment/contract debts
      setText("vaco5655[0].#subform[0].Field51[0]", data.totalMonthlyExpenses); // 23. Total monthly expenses
    },
  },
};

export function getTemplate(formType: string): TemplateConfig | undefined {
  return templates[formType];
}

export function getSupportedPdfForms(): string[] {
  return Object.keys(templates);
}

export async function generateFilledPdf(formType: string, formData: FormData): Promise<Uint8Array> {
  const template = getTemplate(formType);
  if (!template) {
    throw new Error(`No PDF template found for form type ${formType}`);
  }

  const templateAbsolutePath = path.join(process.cwd(), template.templatePath);
  const pdfBytes = await fs.readFile(templateAbsolutePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  template.fill(form, formData);
  form.flatten();

  // Add a note page summarizing unmapped fields for reviewer clarity
  const summaryPage = pdfDoc.addPage();
  const { width, height } = summaryPage.getSize();
  const entries = Object.entries(formData).filter(([, value]) => Boolean(value));
  summaryPage.drawText("Auto-filled summary (for review only):", { x: 50, y: height - 50, size: 12 });
  entries.slice(0, 30).forEach(([key, value], index) => {
    const y = height - 70 - index * 14;
    if (y < 40) return;
    summaryPage.drawText(`${key}: ${value}`, { x: 50, y, size: 10 });
  });

  return pdfDoc.save();
}
