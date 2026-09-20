/**
* | output |
* | --- |
* | "CARE-Y is a call intake and case management system for mutual aid organizations serving populations that are at risk. Both clients and volunteers face real d..." |
*
* @param {Demo_Entry_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_entry_desc: ((inputs?: Demo_Entry_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_DescInputs = {};
