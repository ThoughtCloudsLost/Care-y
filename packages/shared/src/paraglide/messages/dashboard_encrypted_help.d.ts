/**
* | output |
* | --- |
* | "You have {queue} access but not the decryption key for this {ticket}. Access arrives automatically the next time a teammate who can read it signs in." |
*
* @param {Dashboard_Encrypted_HelpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_encrypted_help: ((inputs: Dashboard_Encrypted_HelpInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Encrypted_HelpInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Encrypted_HelpInputs = {
    queue: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
