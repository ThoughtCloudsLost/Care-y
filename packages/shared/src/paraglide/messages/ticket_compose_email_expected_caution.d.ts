/**
* | output |
* | --- |
* | "The client's last message arrived by email. They may be expecting an email reply and might not see this message." |
*
* @param {Ticket_Compose_Email_Expected_CautionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_email_expected_caution: ((inputs?: Ticket_Compose_Email_Expected_CautionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Compose_Email_Expected_CautionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Compose_Email_Expected_CautionInputs = {};
