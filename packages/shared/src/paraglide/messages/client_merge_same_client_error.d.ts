/**
* | output |
* | --- |
* | "Cannot merge a {client} into itself" |
*
* @param {Client_Merge_Same_Client_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_same_client_error: ((inputs: Client_Merge_Same_Client_ErrorInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_Same_Client_ErrorInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_Same_Client_ErrorInputs = {
    client: NonNullable<unknown>;
};
