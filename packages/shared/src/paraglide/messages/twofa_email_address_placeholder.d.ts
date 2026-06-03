/**
* | output |
* | --- |
* | "you@example.com" |
*
* @param {Twofa_Email_Address_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_address_placeholder: ((inputs?: Twofa_Email_Address_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Email_Address_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Email_Address_PlaceholderInputs = {};
