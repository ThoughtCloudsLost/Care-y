/**
* | output |
* | --- |
* | "{count} follow-ups" |
*
* @param {Ticket_Meta_Followup_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_meta_followup_count_other: ((inputs: Ticket_Meta_Followup_Count_OtherInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Meta_Followup_Count_OtherInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Meta_Followup_Count_OtherInputs = {
    count: NonNullable<unknown>;
};
