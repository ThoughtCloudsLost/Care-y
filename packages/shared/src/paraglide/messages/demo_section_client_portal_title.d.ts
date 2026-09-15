/**
* | output |
* | --- |
* | "Secure portal" |
*
* @param {Demo_Section_Client_Portal_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_portal_title: ((inputs?: Demo_Section_Client_Portal_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Client_Portal_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Client_Portal_TitleInputs = {};
