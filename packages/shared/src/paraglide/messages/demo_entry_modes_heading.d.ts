/**
* | output |
* | --- |
* | "Viewing modes" |
*
* @param {Demo_Entry_Modes_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_modes_heading: ((inputs?: Demo_Entry_Modes_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Modes_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Modes_HeadingInputs = {};
