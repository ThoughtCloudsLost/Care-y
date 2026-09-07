/**
* | output |
* | --- |
* | "Email received" |
*
* @param {Ticket_Timeline_Email_Received_PlainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_received_plain: ((inputs?: Ticket_Timeline_Email_Received_PlainInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Email_Received_PlainInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Email_Received_PlainInputs = {};
