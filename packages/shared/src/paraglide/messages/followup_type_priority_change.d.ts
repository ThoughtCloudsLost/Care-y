/**
* | output |
* | --- |
* | "Priority Changes" |
*
* @param {Followup_Type_Priority_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_priority_change: ((inputs?: Followup_Type_Priority_ChangeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Priority_ChangeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Priority_ChangeInputs = {};
