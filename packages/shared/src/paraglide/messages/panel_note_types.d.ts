/**
* | output |
* | --- |
* | "Follow-Up Types" |
*
* @param {Panel_Note_TypesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_note_types: ((inputs?: Panel_Note_TypesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Note_TypesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Note_TypesInputs = {};
