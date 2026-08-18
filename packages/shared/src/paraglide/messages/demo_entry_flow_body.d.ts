/**
* | output |
* | --- |
* | "Open the data flow panel from the top bar. Every interaction in the simulator shows its path through the screen, encryption, API, server, and database lanes...." |
*
* @param {Demo_Entry_Flow_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_flow_body: ((inputs?: Demo_Entry_Flow_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Flow_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Flow_BodyInputs = {};
