/**
* | output |
* | --- |
* | "Resend code" |
*
* @param {Consultant_Phone_ResendInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_resend: ((inputs?: Consultant_Phone_ResendInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_ResendInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_ResendInputs = {};
