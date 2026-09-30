/**
* | output |
* | --- |
* | "A submission the user cannot decrypt still appears in the list with its arrival time and no answers. A second state reports a submission whose key material i..." |
*
* @param {Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_response_key_not_held_body: ((inputs?: Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs = {};
