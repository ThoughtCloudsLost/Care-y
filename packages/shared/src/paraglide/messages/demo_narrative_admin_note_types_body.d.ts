/**
* | output |
* | --- |
* | "The note types section holds two groups. The first is the configurable types the organization defines, each carrying a name, icon, and optional description e..." |
*
* @param {Demo_Narrative_Admin_Note_Types_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_note_types_body: ((inputs?: Demo_Narrative_Admin_Note_Types_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Note_Types_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Note_Types_BodyInputs = {};
