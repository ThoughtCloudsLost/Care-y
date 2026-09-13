/**
* | output |
* | --- |
* | "+1 555 000 1234" |
*
* @param {Consultant_Phone_Number_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_number_placeholder: ((inputs?: Consultant_Phone_Number_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Number_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Number_PlaceholderInputs = {};
