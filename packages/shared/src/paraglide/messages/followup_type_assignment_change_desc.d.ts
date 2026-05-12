/**
* | output |
* | --- |
* | "{Ticket} assigned, taken, or released" |
*
* @param {Followup_Type_Assignment_Change_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_assignment_change_desc: ((inputs: Followup_Type_Assignment_Change_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Assignment_Change_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Assignment_Change_DescInputs = {
    Ticket: NonNullable<unknown>;
};
