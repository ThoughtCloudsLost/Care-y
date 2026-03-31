/**
* | output |
* | --- |
* | "your.username" |
*
* @param {Auth_Username_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_username_placeholder: ((inputs?: Auth_Username_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Username_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Username_PlaceholderInputs = {};
