/**
* | output |
* | --- |
* | "Note types are the categories a note can be filed under, and an organization defines its own set, each with a name, an icon and an optional description, alon..." |
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
