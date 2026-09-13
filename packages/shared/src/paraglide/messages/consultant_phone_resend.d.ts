/**
* | output |
* | --- |
* | "Resend code" |
*
* @param {Consultant_Phone_ResendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_resend: ((inputs?: Consultant_Phone_ResendInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_ResendInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_ResendInputs = {};
