/**
* | output |
* | --- |
* | "The field settings sheet controls the configuration for a single field, and its contents change with the field type. Every field has a label and optional hel..." |
*
* @param {Demo_Narrative_Admin_Field_Config_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_field_config_body: ((inputs?: Demo_Narrative_Admin_Field_Config_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Field_Config_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Field_Config_BodyInputs = {};
