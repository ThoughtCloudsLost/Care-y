/**
* | output |
* | --- |
* | "Each phone line has a number, a purpose role, and associated greetings. On a running CARE-Y server, phone lines connect to numbers provisioned through the te..." |
*
* @param {Demo_Narrative_Admin_Phone_Lines_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_phone_lines_body: ((inputs?: Demo_Narrative_Admin_Phone_Lines_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Phone_Lines_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Phone_Lines_BodyInputs = {};
