/**
* | output |
* | --- |
* | "The viewer lists the submissions one custom form has received, newest first, twenty-five at a time, and decrypts each one in the crypto worker as it arrives...." |
*
* @param {Demo_Narrative_Admin_Form_Responses_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_responses_body: ((inputs?: Demo_Narrative_Admin_Form_Responses_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Form_Responses_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Form_Responses_BodyInputs = {};
