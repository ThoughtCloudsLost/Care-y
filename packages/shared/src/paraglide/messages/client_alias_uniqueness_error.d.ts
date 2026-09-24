/**
* | output |
* | --- |
* | "This alias is already in use" |
*
* @param {Client_Alias_Uniqueness_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_alias_uniqueness_error: ((inputs?: Client_Alias_Uniqueness_ErrorInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Alias_Uniqueness_ErrorInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Alias_Uniqueness_ErrorInputs = {};
