/**
* | output |
* | --- |
* | "The note types section holds two groups. The first is the configurable types the organization defines, each carrying a name, icon, and optional description e..." |
*
* @param {Demo_Narrative_Admin_Note_Types_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_note_types_body: ((inputs?: Demo_Narrative_Admin_Note_Types_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Note_Types_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Note_Types_BodyInputs = {};
