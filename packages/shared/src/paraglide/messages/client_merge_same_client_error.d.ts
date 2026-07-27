/**
* | output |
* | --- |
* | "Cannot merge a {client} into itself" |
*
* @param {Client_Merge_Same_Client_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_same_client_error: ((inputs: Client_Merge_Same_Client_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_Same_Client_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_Same_Client_ErrorInputs = {
    client: NonNullable<unknown>;
};
