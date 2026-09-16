/**
* | output |
* | --- |
* | "When a response was encrypted under a key the user does not hold, the response row shows the submission time but not the field values, so the user can see th..." |
*
* @param {Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_response_key_not_held_body: ((inputs?: Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs = {};
