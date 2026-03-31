/**
* | output |
* | --- |
* | "Could not reach the server. Check your connection." |
*
* @param {Error_NetworkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_network: ((inputs?: Error_NetworkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_NetworkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_NetworkInputs = {};
