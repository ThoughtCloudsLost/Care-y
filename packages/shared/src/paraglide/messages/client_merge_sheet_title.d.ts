/**
* | output |
* | --- |
* | "Merge {Clients}" |
*
* @param {Client_Merge_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_sheet_title: ((inputs: Client_Merge_Sheet_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_Sheet_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_Sheet_TitleInputs = {
    Clients: NonNullable<unknown>;
};
