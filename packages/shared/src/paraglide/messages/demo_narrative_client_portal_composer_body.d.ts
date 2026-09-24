/**
* | output |
* | --- |
* | "A reply is encrypted in the browser before it is sent, so what the server receives and stores is ciphertext it cannot open, and the client can write up to 5,..." |
*
* @param {Demo_Narrative_Client_Portal_Composer_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_composer_body: ((inputs?: Demo_Narrative_Client_Portal_Composer_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Portal_Composer_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Portal_Composer_BodyInputs = {};
