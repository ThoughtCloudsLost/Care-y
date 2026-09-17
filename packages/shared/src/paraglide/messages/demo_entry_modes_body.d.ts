/**
* | output |
* | --- |
* | "Read and Simulate are toggled from the top bar. Read mode shows the handbook as a document with the simulator hidden but still running, and you can long pres..." |
*
* @param {Demo_Entry_Modes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_modes_body: ((inputs?: Demo_Entry_Modes_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Modes_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Modes_BodyInputs = {};
