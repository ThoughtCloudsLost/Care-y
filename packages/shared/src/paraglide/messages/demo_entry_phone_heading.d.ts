/**
* | output |
* | --- |
* | "Move the phone wherever you like" |
*
* @param {Demo_Entry_Phone_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_phone_heading: ((inputs?: Demo_Entry_Phone_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Phone_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Phone_HeadingInputs = {};
