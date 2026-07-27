/**
* | output |
* | --- |
* | "{count} {tickets}" |
*
* @param {Clients_Ticket_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_ticket_count_other: ((inputs: Clients_Ticket_Count_OtherInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Ticket_Count_OtherInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Ticket_Count_OtherInputs = {
    count: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
