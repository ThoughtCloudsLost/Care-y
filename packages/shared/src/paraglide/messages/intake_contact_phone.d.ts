/**
* | output |
* | --- |
* | "Text or call my phone" |
*
* @param {Intake_Contact_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_contact_phone: ((inputs?: Intake_Contact_PhoneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Contact_PhoneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Contact_PhoneInputs = {};
