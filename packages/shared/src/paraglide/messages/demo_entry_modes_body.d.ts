/**
* | output |
* | --- |
* | "Switch between the read-only handbook and the interactive simulator app from the top bar. Read shows the handbook as a document. The simulator is hidden but ..." |
*
* @param {Demo_Entry_Modes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_entry_modes_body: ((inputs?: Demo_Entry_Modes_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Modes_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Modes_BodyInputs = {};
