/**
* | output |
* | --- |
* | "Verification code" |
*
* @param {Consultant_Phone_Code_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_code_label: ((inputs?: Consultant_Phone_Code_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Code_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Code_LabelInputs = {};
