/**
* | output |
* | --- |
* | "An organization's phone lines are the numbers its provider account holds, each one carrying a number and the provider's own id for it. Two purposes can be as..." |
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
