/**
* | output |
* | --- |
* | "Greetings are what callers hear when they reach a phone line. Five greeting types each serve a different point in the call flow, covering the initial answer,..." |
*
* @param {Demo_Narrative_Admin_Greetings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_greetings_body: ((inputs?: Demo_Narrative_Admin_Greetings_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Greetings_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Greetings_BodyInputs = {};
