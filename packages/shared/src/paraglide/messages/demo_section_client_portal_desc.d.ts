/**
* | output |
* | --- |
* | "The secure portal lets a client continue the conversation with the organization. Access comes through a link sent by a volunteer, and the credential that unl..." |
*
* @param {Demo_Section_Client_Portal_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_portal_desc: ((inputs?: Demo_Section_Client_Portal_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Client_Portal_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Client_Portal_DescInputs = {};
