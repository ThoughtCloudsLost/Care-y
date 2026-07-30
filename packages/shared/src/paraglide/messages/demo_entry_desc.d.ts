/**
* | output |
* | --- |
* | "CARE-Y is a call intake system for people who cannot afford to be identified. This demo runs the real application in your browser, with a story alongside it ..." |
*
* @param {Demo_Entry_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_desc: ((inputs?: Demo_Entry_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_DescInputs = {};
