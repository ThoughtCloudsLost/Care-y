/**
* | output |
* | --- |
* | "Could not unlock this content." |
*
* @param {Library_Encrypted_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_encrypted_body: ((inputs?: Library_Encrypted_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Encrypted_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Encrypted_BodyInputs = {};
