/**
* | output |
* | --- |
* | "Shared line" |
*
* @param {Phone_Shared_Line_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const phone_shared_line_label: ((inputs?: Phone_Shared_Line_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Phone_Shared_Line_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Phone_Shared_Line_LabelInputs = {};
