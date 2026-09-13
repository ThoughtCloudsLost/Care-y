/**
* | output |
* | --- |
* | "No email address on file for this {client}." |
*
* @param {Error_Client_Email_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_client_email_not_found: ((inputs: Error_Client_Email_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Client_Email_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Client_Email_Not_FoundInputs = {
    client: NonNullable<unknown>;
};
