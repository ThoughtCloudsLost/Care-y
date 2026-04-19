/**
* | output |
* | --- |
* | "All client information is encrypted before it reaches the server. Only your team can decrypt it." |
*
* @param {Vol_Clients_EncryptedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_clients_encrypted: ((inputs?: Vol_Clients_EncryptedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Clients_EncryptedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Clients_EncryptedInputs = {};
