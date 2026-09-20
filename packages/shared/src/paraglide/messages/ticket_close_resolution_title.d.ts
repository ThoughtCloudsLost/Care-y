/**
* | output |
* | --- |
* | "Close {ticket}" |
*
* @param {Ticket_Close_Resolution_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_close_resolution_title: ((inputs: Ticket_Close_Resolution_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Close_Resolution_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Close_Resolution_TitleInputs = {
    ticket: NonNullable<unknown>;
};
