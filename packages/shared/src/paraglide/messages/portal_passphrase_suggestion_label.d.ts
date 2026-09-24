/**
* | output |
* | --- |
* | "Here is a suggested password you can copy:" |
*
* @param {Portal_Passphrase_Suggestion_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_suggestion_label: ((inputs?: Portal_Passphrase_Suggestion_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_Suggestion_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_Suggestion_LabelInputs = {};
