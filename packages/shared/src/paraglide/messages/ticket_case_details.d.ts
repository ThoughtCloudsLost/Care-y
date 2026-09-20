/**
* | output |
* | --- |
* | "{Ticket} details" |
*
* @param {Ticket_Case_DetailsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_case_details: ((inputs: Ticket_Case_DetailsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Case_DetailsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Case_DetailsInputs = {
    Ticket: NonNullable<unknown>;
};
