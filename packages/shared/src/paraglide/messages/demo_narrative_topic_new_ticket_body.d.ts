/**
* | output |
* | --- |
* | "When you create a ticket, the title and description are encrypted in your browser before they leave the device. The server stores ciphertext and assigns a ti..." |
*
* @param {Demo_Narrative_Topic_New_Ticket_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_new_ticket_body: ((inputs?: Demo_Narrative_Topic_New_Ticket_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_New_Ticket_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_New_Ticket_BodyInputs = {};
