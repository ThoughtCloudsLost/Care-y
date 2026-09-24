/**
* | output |
* | --- |
* | "Shared line" |
*
* @param {Phone_Shared_Line_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const phone_shared_line_label: ((inputs?: Phone_Shared_Line_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Phone_Shared_Line_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Phone_Shared_Line_LabelInputs = {};
