/**
* | output |
* | --- |
* | "{Ticket} assigned to you" |
*
* @param {Ticket_Toast_TakenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_taken: ((inputs: Ticket_Toast_TakenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_TakenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_TakenInputs = {
    Ticket: NonNullable<unknown>;
};
