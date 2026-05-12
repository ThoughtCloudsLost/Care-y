/**
* | output |
* | --- |
* | "This {client} has been merged into another {client}." |
*
* @param {Error_Client_MergedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_client_merged: ((inputs: Error_Client_MergedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Client_MergedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Client_MergedInputs = {
    client: NonNullable<unknown>;
};
