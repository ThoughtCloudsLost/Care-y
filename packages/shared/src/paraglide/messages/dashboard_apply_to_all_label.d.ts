/**
* | output |
* | --- |
* | "Apply these filters to all {tickets} sections" |
*
* @param {Dashboard_Apply_To_All_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_apply_to_all_label: ((inputs: Dashboard_Apply_To_All_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Apply_To_All_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Apply_To_All_LabelInputs = {
    tickets: NonNullable<unknown>;
};
