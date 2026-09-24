/**
* | output |
* | --- |
* | "Read and Simulate are toggled from the top bar. Read mode shows the handbook as a document with the simulator hidden but still running. Simulate mode shows t..." |
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
