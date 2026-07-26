/**
* | output |
* | --- |
* | "+1 555 000 1234" |
*
* @param {Client_Phone_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_placeholder: ((inputs?: Client_Phone_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Phone_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Phone_PlaceholderInputs = {};
