/**
* | output |
* | --- |
* | "The portal reply composer encrypts each message in the browser before sending the ciphertext to the server, with a limit of 5000 characters and a counter tha..." |
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
