/**
* | output |
* | --- |
* | "Case details" |
*
* @param {Ticket_Case_DetailsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_case_details: ((inputs?: Ticket_Case_DetailsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Case_DetailsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Case_DetailsInputs = {};
