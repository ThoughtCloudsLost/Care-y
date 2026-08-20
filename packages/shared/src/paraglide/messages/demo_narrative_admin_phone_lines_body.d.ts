/**
* | output |
* | --- |
* | "Each phone line has a number, a purpose role, and associated greetings. Purpose roles like intake and outbound determine how the line is used. The simulator ..." |
*
* @param {Demo_Narrative_Admin_Phone_Lines_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_phone_lines_body: ((inputs?: Demo_Narrative_Admin_Phone_Lines_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Phone_Lines_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Phone_Lines_BodyInputs = {};
