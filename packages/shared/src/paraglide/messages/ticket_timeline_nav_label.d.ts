/**
* | output |
* | --- |
* | "Conversation timeline" |
*
* @param {Ticket_Timeline_Nav_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_nav_label: ((inputs?: Ticket_Timeline_Nav_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Nav_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Nav_LabelInputs = {};
