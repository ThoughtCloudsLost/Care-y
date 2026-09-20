/**
* | output |
* | --- |
* | "Verifying..." |
*
* @param {Consultant_Phone_VerifyingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_verifying: ((inputs?: Consultant_Phone_VerifyingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_VerifyingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_VerifyingInputs = {};
