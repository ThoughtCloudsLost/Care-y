/**
* | output |
* | --- |
* | "Internal team note..." |
*
* @param {Ticket_Compose_Note_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_note_placeholder: ((inputs?: Ticket_Compose_Note_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Compose_Note_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Compose_Note_PlaceholderInputs = {};
