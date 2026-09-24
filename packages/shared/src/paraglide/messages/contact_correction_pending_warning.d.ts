/**
* | output |
* | --- |
* | "A contact correction is pending below. Verify before contacting." |
*
* @param {Contact_Correction_Pending_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const contact_correction_pending_warning: ((inputs?: Contact_Correction_Pending_WarningInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Contact_Correction_Pending_WarningInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Contact_Correction_Pending_WarningInputs = {};
