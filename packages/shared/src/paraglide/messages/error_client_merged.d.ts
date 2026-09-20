/**
* | output |
* | --- |
* | "This {client} has been merged into another {client}." |
*
* @param {Error_Client_MergedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_client_merged: ((inputs: Error_Client_MergedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Client_MergedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Client_MergedInputs = {
    client: NonNullable<unknown>;
};
