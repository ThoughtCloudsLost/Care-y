/**
* | output |
* | --- |
* | "The client encrypts each reply in the browser before sending it. The server receives and stores ciphertext it cannot open. [[#portal #encryption]] **Who can ..." |
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
