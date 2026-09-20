/**
* | output |
* | --- |
* | "Merged" |
*
* @param {Clients_Merged_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_merged_label: ((inputs?: Clients_Merged_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Merged_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Merged_LabelInputs = {};
