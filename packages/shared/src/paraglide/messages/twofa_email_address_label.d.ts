/**
* | output |
* | --- |
* | "Email address" |
*
* @param {Twofa_Email_Address_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_address_label: ((inputs?: Twofa_Email_Address_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Email_Address_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Email_Address_LabelInputs = {};
