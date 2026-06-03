/**
* | output |
* | --- |
* | "Recent {ticket} history will appear here." |
*
* @param {Ticket_Panel_Recent_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_recent_coming_soon: ((inputs: Ticket_Panel_Recent_Coming_SoonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Panel_Recent_Coming_SoonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Panel_Recent_Coming_SoonInputs = {
    ticket: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
