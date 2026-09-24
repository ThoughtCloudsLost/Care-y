/**
* | output |
* | --- |
* | "Or route to an existing ticket" |
*
* @param {Admin_Quarantine_Route_Ticket_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_ticket_label: ((inputs?: Admin_Quarantine_Route_Ticket_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_Route_Ticket_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_Route_Ticket_LabelInputs = {};
