/**
* | output |
* | --- |
* | "participants" |
*
* @param {Ticket_Note_Hint_ParticipantsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_note_hint_participants: ((inputs?: Ticket_Note_Hint_ParticipantsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Note_Hint_ParticipantsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Note_Hint_ParticipantsInputs = {};
