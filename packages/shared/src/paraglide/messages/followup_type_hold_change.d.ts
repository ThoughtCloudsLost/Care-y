/**
* | output |
* | --- |
* | "Hold Changes" |
*
* @param {Followup_Type_Hold_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_hold_change: ((inputs?: Followup_Type_Hold_ChangeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Hold_ChangeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Hold_ChangeInputs = {};
