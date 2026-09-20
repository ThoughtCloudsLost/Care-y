/**
* | output |
* | --- |
* | "Enter a number like +1 555 000 1234" |
*
* @param {Consultant_Phone_InvalidInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_invalid: ((inputs?: Consultant_Phone_InvalidInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_InvalidInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_InvalidInputs = {};
