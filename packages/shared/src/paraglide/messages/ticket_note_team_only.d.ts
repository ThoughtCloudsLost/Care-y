/**
* | output |
* | --- |
* | "Internal note" |
*
* @param {Ticket_Note_Team_OnlyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_note_team_only: ((inputs?: Ticket_Note_Team_OnlyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Note_Team_OnlyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Note_Team_OnlyInputs = {};
