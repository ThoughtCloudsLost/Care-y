/**
* | output |
* | --- |
* | "Notifies {targets}" |
*
* @param {Ticket_Note_NotifiesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_notifies: ((inputs: Ticket_Note_NotifiesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Note_NotifiesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Note_NotifiesInputs = {
    targets: NonNullable<unknown>;
};
