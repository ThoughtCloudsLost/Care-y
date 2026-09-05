/**
* | output |
* | --- |
* | "This is the contact info on file to reach you." |
*
* @param {Portal_Contact_Footer_GenericInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_contact_footer_generic: ((inputs?: Portal_Contact_Footer_GenericInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Contact_Footer_GenericInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Contact_Footer_GenericInputs = {};
