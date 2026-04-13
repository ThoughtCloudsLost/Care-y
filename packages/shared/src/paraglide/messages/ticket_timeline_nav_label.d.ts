/**
* | output |
* | --- |
* | "Conversation timeline" |
*
* @param {Ticket_Timeline_Nav_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_nav_label: ((inputs?: Ticket_Timeline_Nav_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Nav_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Nav_LabelInputs = {};
