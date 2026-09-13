/**
* | output |
* | --- |
* | "Enter a number like +1 555 000 1234" |
*
* @param {Consultant_Phone_InvalidInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_invalid: ((inputs?: Consultant_Phone_InvalidInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_InvalidInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_InvalidInputs = {};
