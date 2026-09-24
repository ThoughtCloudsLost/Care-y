/**
* | output |
* | --- |
* | "{Ticket} placed on hold or resumed" |
*
* @param {Followup_Type_Hold_Change_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_hold_change_desc: ((inputs: Followup_Type_Hold_Change_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Hold_Change_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Hold_Change_DescInputs = {
    Ticket: NonNullable<unknown>;
};
