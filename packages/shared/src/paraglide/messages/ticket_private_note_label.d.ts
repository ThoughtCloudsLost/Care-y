/**
* | output |
* | --- |
* | "Only your team can see this" |
*
* @param {Ticket_Private_Note_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_private_note_label: ((inputs?: Ticket_Private_Note_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Private_Note_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Private_Note_LabelInputs = {};
