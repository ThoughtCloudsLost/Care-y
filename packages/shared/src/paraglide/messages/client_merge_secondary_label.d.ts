/**
* | output |
* | --- |
* | "Secondary (merged in)" |
*
* @param {Client_Merge_Secondary_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_secondary_label: ((inputs?: Client_Merge_Secondary_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_Secondary_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_Secondary_LabelInputs = {};
