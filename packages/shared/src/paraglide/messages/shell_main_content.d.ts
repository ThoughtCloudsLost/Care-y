/**
* | output |
* | --- |
* | "Main content" |
*
* @param {Shell_Main_ContentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const shell_main_content: ((inputs?: Shell_Main_ContentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Shell_Main_ContentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Shell_Main_ContentInputs = {};
