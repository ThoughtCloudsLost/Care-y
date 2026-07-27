/**
* | output |
* | --- |
* | "Secondary (merged in)" |
*
* @param {Client_Merge_Secondary_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_secondary_label: ((inputs?: Client_Merge_Secondary_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_Secondary_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_Secondary_LabelInputs = {};
