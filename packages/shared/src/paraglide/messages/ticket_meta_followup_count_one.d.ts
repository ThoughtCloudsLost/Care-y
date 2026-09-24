/**
* | output |
* | --- |
* | "{count} follow-up" |
*
* @param {Ticket_Meta_Followup_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_meta_followup_count_one: ((inputs: Ticket_Meta_Followup_Count_OneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Meta_Followup_Count_OneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Meta_Followup_Count_OneInputs = {
    count: NonNullable<unknown>;
};
