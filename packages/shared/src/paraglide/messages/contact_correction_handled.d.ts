/**
* | output |
* | --- |
* | "Handled" |
*
* @param {Contact_Correction_HandledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const contact_correction_handled: ((inputs?: Contact_Correction_HandledInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Contact_Correction_HandledInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Contact_Correction_HandledInputs = {};
