/**
* | output |
* | --- |
* | "Loading older messages..." |
*
* @param {Ticket_Loading_OlderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_loading_older: ((inputs?: Ticket_Loading_OlderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Loading_OlderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Loading_OlderInputs = {};
