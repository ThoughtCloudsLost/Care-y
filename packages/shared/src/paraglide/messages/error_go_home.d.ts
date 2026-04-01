/**
* | output |
* | --- |
* | "Go home" |
*
* @param {Error_Go_HomeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_go_home: ((inputs?: Error_Go_HomeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Go_HomeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Go_HomeInputs = {};
