/**
* | output |
* | --- |
* | "Nothing here yet." |
*
* @param {Empty_No_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const empty_no_data: ((inputs?: Empty_No_DataInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Empty_No_DataInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Empty_No_DataInputs = {};
