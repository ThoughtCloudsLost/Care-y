/**
* | output |
* | --- |
* | "{count} volunteers" |
*
* @param {Ticket_Detail_Volunteers_StatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_detail_volunteers_stat: ((inputs: Ticket_Detail_Volunteers_StatInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Detail_Volunteers_StatInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Detail_Volunteers_StatInputs = {
    count: NonNullable<unknown>;
};
