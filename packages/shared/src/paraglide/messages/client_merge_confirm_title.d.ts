/**
* | output |
* | --- |
* | "Confirm merge" |
*
* @param {Client_Merge_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_confirm_title: ((inputs?: Client_Merge_Confirm_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_Confirm_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_Confirm_TitleInputs = {};
