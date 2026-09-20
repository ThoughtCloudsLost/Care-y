/**
* | output |
* | --- |
* | "Email me" |
*
* @param {Intake_Contact_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_contact_email: ((inputs?: Intake_Contact_EmailInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Contact_EmailInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Contact_EmailInputs = {};
