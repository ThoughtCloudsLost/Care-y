/**
* | output |
* | --- |
* | "Why is this encrypted?" |
*
* @param {Dashboard_Encrypted_Help_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_encrypted_help_label: ((inputs?: Dashboard_Encrypted_Help_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Encrypted_Help_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Encrypted_Help_LabelInputs = {};
