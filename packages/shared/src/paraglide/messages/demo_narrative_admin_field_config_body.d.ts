/**
* | output |
* | --- |
* | "A field's settings hold everything about that one field, and what they offer changes with its type. Every field carries a label and optional help text in eac..." |
*
* @param {Demo_Narrative_Admin_Field_Config_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_field_config_body: ((inputs?: Demo_Narrative_Admin_Field_Config_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Field_Config_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Field_Config_BodyInputs = {};
