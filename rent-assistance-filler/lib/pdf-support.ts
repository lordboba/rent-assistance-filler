import { FORM_TYPES } from "./types";

export const SUPPORTED_PDF_FORMS = ["section-8", "va-benefits-verification", "income-verification"];

export const COMING_SOON_PDF_FORMS = FORM_TYPES.filter((f) => !SUPPORTED_PDF_FORMS.includes(f.id)).map(
  (f) => f.id
);

export function isPdfSupported(formId?: string | null) {
  if (!formId) return false;
  return SUPPORTED_PDF_FORMS.includes(formId);
}
