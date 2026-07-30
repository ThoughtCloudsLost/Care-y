/**
* | output |
* | --- |
* | "The demo begins at the login screen, where CARE-Y derives the encryption keys that protect everything else. Everything you see is fictional: the volunteers, ..." |
*
* @param {Demo_Entry_Start_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_start_body: ((inputs?: Demo_Entry_Start_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Start_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Start_BodyInputs = {};
