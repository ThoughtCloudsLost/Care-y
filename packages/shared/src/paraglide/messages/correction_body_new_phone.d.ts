/**
* | output |
* | --- |
* | "New phone" |
*
* @param {Correction_Body_New_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const correction_body_new_phone: ((inputs?: Correction_Body_New_PhoneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Correction_Body_New_PhoneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Correction_Body_New_PhoneInputs = {};
