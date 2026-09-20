/**
* | output |
* | --- |
* | "Other languages can be configured later in Organization Settings." |
*
* @param {Onboarding_Org_Terminology_Admin_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_terminology_admin_note: ((inputs?: Onboarding_Org_Terminology_Admin_NoteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Org_Terminology_Admin_NoteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Org_Terminology_Admin_NoteInputs = {};
