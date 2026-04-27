/**
* | output |
* | --- |
* | "Your organization key encrypts shared data: volunteer names, knowledge base articles, queue names, and branding. Ticket conversations and client information ..." |
*
* @param {Admin_Keys_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_explainer: ((inputs?: Admin_Keys_ExplainerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Keys_ExplainerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Keys_ExplainerInputs = {};
