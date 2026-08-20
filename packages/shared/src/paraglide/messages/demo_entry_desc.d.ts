/**
* | output |
* | --- |
* | "CARE-Y is a call intake and case management system for mutual aid organizations serving at-risk populations. Both clients and volunteers face real danger if ..." |
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
