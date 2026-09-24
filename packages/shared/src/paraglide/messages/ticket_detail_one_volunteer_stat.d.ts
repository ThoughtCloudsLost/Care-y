/**
* | output |
* | --- |
* | "1 {volunteer}" |
*
* @param {Ticket_Detail_One_Volunteer_StatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_detail_one_volunteer_stat: ((inputs: Ticket_Detail_One_Volunteer_StatInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Detail_One_Volunteer_StatInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Detail_One_Volunteer_StatInputs = {
    volunteer: NonNullable<unknown>;
};
