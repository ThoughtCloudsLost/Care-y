/**
* | output |
* | --- |
* | "No contact info on file." |
*
* @param {Portal_Contact_NoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_contact_none: ((inputs?: Portal_Contact_NoneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Contact_NoneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Contact_NoneInputs = {};
