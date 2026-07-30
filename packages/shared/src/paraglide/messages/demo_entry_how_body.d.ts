/**
* | output |
* | --- |
* | "The phone on this page runs the actual CARE-Y client against a database that lives inside your browser. Nothing is sent to a server and nothing you type here..." |
*
* @param {Demo_Entry_How_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_how_body: ((inputs?: Demo_Entry_How_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_How_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_How_BodyInputs = {};
