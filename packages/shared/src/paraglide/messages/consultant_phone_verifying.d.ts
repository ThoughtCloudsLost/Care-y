/**
* | output |
* | --- |
* | "Verifying..." |
*
* @param {Consultant_Phone_VerifyingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_verifying: ((inputs?: Consultant_Phone_VerifyingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_VerifyingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_VerifyingInputs = {};
