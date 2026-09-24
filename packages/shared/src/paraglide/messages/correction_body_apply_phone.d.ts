/**
* | output |
* | --- |
* | "Apply phone number" |
*
* @param {Correction_Body_Apply_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const correction_body_apply_phone: ((inputs?: Correction_Body_Apply_PhoneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Correction_Body_Apply_PhoneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Correction_Body_Apply_PhoneInputs = {};
