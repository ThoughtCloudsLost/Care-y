/**
* | output |
* | --- |
* | "An unreadable response row shows what a user sees when an intake response was encrypted under a key they do not hold. The card displays the submission date, ..." |
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
