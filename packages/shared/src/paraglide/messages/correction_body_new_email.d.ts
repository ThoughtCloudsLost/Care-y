/**
* | output |
* | --- |
* | "New email" |
*
* @param {Correction_Body_New_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const correction_body_new_email: ((inputs?: Correction_Body_New_EmailInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Correction_Body_New_EmailInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Correction_Body_New_EmailInputs = {};
