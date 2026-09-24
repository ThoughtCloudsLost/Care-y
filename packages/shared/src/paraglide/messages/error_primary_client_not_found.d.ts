/**
* | output |
* | --- |
* | "Primary {client} not found." |
*
* @param {Error_Primary_Client_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_primary_client_not_found: ((inputs: Error_Primary_Client_Not_FoundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Primary_Client_Not_FoundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Primary_Client_Not_FoundInputs = {
    client: NonNullable<unknown>;
    Client: NonNullable<unknown>;
};
