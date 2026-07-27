/**
* | output |
* | --- |
* | "Search for a {client} to merge..." |
*
* @param {Client_Merge_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_search_placeholder: ((inputs: Client_Merge_Search_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_Search_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_Search_PlaceholderInputs = {
    client: NonNullable<unknown>;
};
