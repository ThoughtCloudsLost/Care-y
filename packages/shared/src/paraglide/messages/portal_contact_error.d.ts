/**
* | output |
* | --- |
* | "Could not load your contact info. Try again later." |
*
* @param {Portal_Contact_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_contact_error: ((inputs?: Portal_Contact_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Contact_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Contact_ErrorInputs = {};
