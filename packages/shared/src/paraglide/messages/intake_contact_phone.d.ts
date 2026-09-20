/**
* | output |
* | --- |
* | "Text or call my phone" |
*
* @param {Intake_Contact_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_contact_phone: ((inputs?: Intake_Contact_PhoneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Contact_PhoneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Contact_PhoneInputs = {};
