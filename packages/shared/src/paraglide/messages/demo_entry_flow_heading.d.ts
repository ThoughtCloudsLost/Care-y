/**
* | output |
* | --- |
* | "Data flow panel" |
*
* @param {Demo_Entry_Flow_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_flow_heading: ((inputs?: Demo_Entry_Flow_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Flow_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Flow_HeadingInputs = {};
