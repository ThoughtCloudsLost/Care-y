/**
* | output |
* | --- |
* | "Each phone line can carry a greeting for each language the organization serves at each point in an inbound call: - Welcome message plays when a caller first ..." |
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
