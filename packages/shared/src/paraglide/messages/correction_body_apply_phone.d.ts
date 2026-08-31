/**
* | output |
* | --- |
* | "Apply phone number" |
*
* @param {Correction_Body_Apply_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const correction_body_apply_phone: ((inputs?: Correction_Body_Apply_PhoneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Correction_Body_Apply_PhoneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Correction_Body_Apply_PhoneInputs = {};
