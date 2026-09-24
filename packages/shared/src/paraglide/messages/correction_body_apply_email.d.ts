/**
* | output |
* | --- |
* | "Apply email address" |
*
* @param {Correction_Body_Apply_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const correction_body_apply_email: ((inputs?: Correction_Body_Apply_EmailInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Correction_Body_Apply_EmailInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Correction_Body_Apply_EmailInputs = {};
