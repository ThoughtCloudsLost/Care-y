/**
* | output |
* | --- |
* | "That alias is already in use. Choose a different one." |
*
* @param {Error_Client_Alias_ConflictInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_client_alias_conflict: ((inputs?: Error_Client_Alias_ConflictInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Client_Alias_ConflictInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Client_Alias_ConflictInputs = {};
