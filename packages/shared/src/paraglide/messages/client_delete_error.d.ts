/**
* | output |
* | --- |
* | "Could not delete {client}." |
*
* @param {Client_Delete_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_delete_error: ((inputs: Client_Delete_ErrorInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Delete_ErrorInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Delete_ErrorInputs = {
    client: NonNullable<unknown>;
};
