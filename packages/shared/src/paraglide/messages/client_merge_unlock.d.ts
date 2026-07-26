/**
* | output |
* | --- |
* | "Unlock merge" |
*
* @param {Client_Merge_UnlockInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_unlock: ((inputs?: Client_Merge_UnlockInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_UnlockInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_UnlockInputs = {};
