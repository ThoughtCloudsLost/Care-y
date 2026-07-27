/**
* | output |
* | --- |
* | "{count} {ticket}" |
*
* @param {Clients_Ticket_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_ticket_count_one: ((inputs: Clients_Ticket_Count_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Ticket_Count_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Ticket_Count_OneInputs = {
    count: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
