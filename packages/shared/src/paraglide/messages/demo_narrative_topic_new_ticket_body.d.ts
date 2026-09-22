/**
* | output |
* | --- |
* | "Opening a ticket seals its title and description in the browser under a key minted there, and the server files the ciphertext without ever holding the key. [..." |
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
