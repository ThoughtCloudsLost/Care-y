/**
* | output |
* | --- |
* | "How Clients Are Protected" |
*
* @param {Vol_Section_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_section_clients: ((inputs?: Vol_Section_ClientsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Section_ClientsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Section_ClientsInputs = {};
