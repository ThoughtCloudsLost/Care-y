/**
* | output |
* | --- |
* | "Primary (survives)" |
*
* @param {Client_Merge_Primary_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_primary_label: ((inputs?: Client_Merge_Primary_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_Primary_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_Primary_LabelInputs = {};
