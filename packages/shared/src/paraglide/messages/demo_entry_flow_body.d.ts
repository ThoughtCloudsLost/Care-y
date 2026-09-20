/**
* | output |
* | --- |
* | "The Data flow button in the top bar opens the data flow panel, and every interaction in the simulator traces its path through screen, encryption, API, server..." |
*
* @param {Demo_Entry_Flow_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_entry_flow_body: ((inputs?: Demo_Entry_Flow_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Flow_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Flow_BodyInputs = {};
