/**
* | output |
* | --- |
* | "Dismiss email caution" |
*
* @param {Ticket_Compose_Email_Expected_DismissInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_email_expected_dismiss: ((inputs?: Ticket_Compose_Email_Expected_DismissInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Compose_Email_Expected_DismissInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Compose_Email_Expected_DismissInputs = {};
