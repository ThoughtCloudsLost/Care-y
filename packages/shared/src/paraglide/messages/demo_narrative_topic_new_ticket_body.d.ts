/**
* | output |
* | --- |
* | "When a volunteer creates a ticket, the title and description are encrypted in the browser before they leave the device. The server stores the ciphertext and ..." |
*
* @param {Demo_Narrative_Topic_New_Ticket_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_new_ticket_body: ((inputs?: Demo_Narrative_Topic_New_Ticket_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_New_Ticket_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_New_Ticket_BodyInputs = {};
