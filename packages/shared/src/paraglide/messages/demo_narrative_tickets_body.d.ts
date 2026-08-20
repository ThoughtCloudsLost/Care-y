/**
* | output |
* | --- |
* | "Ticket titles, descriptions, and messages are encrypted with keys only your browser holds. The server stores ciphertext and never sees the content." |
*
* @param {Demo_Narrative_Tickets_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_tickets_body: ((inputs?: Demo_Narrative_Tickets_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Tickets_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Tickets_BodyInputs = {};
