/**
* | output |
* | --- |
* | "Filter loaded rows..." |
*
* @param {Clients_Search_Loaded_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_search_loaded_placeholder: ((inputs?: Clients_Search_Loaded_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Search_Loaded_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Search_Loaded_PlaceholderInputs = {};
