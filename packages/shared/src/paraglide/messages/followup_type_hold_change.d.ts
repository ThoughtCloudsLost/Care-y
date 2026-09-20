/**
* | output |
* | --- |
* | "Hold Changes" |
*
* @param {Followup_Type_Hold_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_hold_change: ((inputs?: Followup_Type_Hold_ChangeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Hold_ChangeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Hold_ChangeInputs = {};
