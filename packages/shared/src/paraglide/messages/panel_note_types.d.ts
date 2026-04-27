/**
* | output |
* | --- |
* | "Follow-Up Types" |
*
* @param {Panel_Note_TypesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_note_types: ((inputs?: Panel_Note_TypesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Note_TypesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Note_TypesInputs = {};
