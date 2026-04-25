/**
* | output |
* | --- |
* | "Urgent, high, normal, low transitions" |
*
* @param {Followup_Type_Priority_Change_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_priority_change_desc: ((inputs?: Followup_Type_Priority_Change_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Priority_Change_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Priority_Change_DescInputs = {};
