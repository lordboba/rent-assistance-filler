**Veterans Rent-Assistance Filler**

We are building an automated AI agent to assist homeless veterans to speed up the process of filling out long and difficult rental forms.

Here are the elements that we would like to build.

Website: TypeScript/Next.js w/Firebase Authentication, a Redis localized next.js database(where we will put in the REDIS_URL in .env)

Color Theme and Font: Simple, white, background with Source Sans Pro and Merriweather as the core fonts.

Website Ideal Workflow:

1. **User Onboarding & Authentication**
   - Veteran signs in via Firebase Authentication
   - Complete initial profile with basic personal information
   - Upload supporting documents (DD-214, VA benefits letter, ID)

2. **Document Intake & Processing**
   - AI extracts data from uploaded documents using OCR
   - Parsed data stored in Redis for quick retrieval
   - User reviews and confirms extracted information

3. **Form Selection**
   - User selects which form(s) they need to complete
   - AI recommends additional forms based on user eligibility

4. **AI-Assisted Form Filling**
   - AI pre-populates form fields from stored profile data
   - Interactive Q&A for missing information
   - Real-time validation and error checking

5. **Review & Export**
   - User reviews completed forms
   - Export as PDF or submit electronically where supported
   - Save progress for future applications

---

**Supported Form Types:**

| Form Type | Description | Key Forms/Notes |
|-----------|-------------|-----------------|
| HUD-VASH Application | Housing and Urban Development - VA Supportive Housing voucher | No online form - referral via VA Medical Center or 877-424-3838 |
| SSVF Intake Form | Supportive Services for Veteran Families program intake | Forms at va.gov/homeless/ssvf/forms/1b |
| Standard Rental Application | Generic landlord/property management applications | Request for Tenancy Approval (RFTA) for voucher programs |
| Income Verification Form | Proof of income documentation | VA Form 5655, Income Verification Report (IVR) |
| VA Benefits Verification | Request for VA benefit status confirmation | VA Form 26-8937, Benefit Verification Letter via eBenefits |
| Housing Authority Application | Local public housing authority applications | Varies by PHA - find via hud.gov/contactus/public-housing-contacts |
| Emergency Rental Assistance (ERA) | State-level emergency rent relief programs | Federal ERA winding down; check state-specific programs (e.g., NY VEHP, WI VRAP) |
| Section 8 Housing Choice Voucher | Federal housing assistance program application | Apply via local PHA; veteran preference available |
| Landlord Verification Form | Rental history verification for housing programs | USDA RD 1944-0060, state-specific forms |
