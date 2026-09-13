/**
* | output |
* | --- |
* | "Verify" |
*
* @param {Consultant_Phone_VerifyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_verify: ((inputs?: Consultant_Phone_VerifyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_VerifyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_VerifyInputs = {};
