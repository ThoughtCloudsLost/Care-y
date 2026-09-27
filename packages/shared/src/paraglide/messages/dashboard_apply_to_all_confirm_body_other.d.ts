/**
* | output |
* | --- |
* | "{count} other sections have their own filters. Applying replaces them." |
*
* @param {Dashboard_Apply_To_All_Confirm_Body_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_apply_to_all_confirm_body_other: ((inputs: Dashboard_Apply_To_All_Confirm_Body_OtherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Apply_To_All_Confirm_Body_OtherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Apply_To_All_Confirm_Body_OtherInputs = {
    count: NonNullable<unknown>;
};
