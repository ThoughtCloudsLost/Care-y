/**
* | output |
* | --- |
* | "Decrypting..." |
*
* @param {Tickets_DecryptingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_decrypting: ((inputs?: Tickets_DecryptingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_DecryptingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_DecryptingInputs = {};
