/**
* | output |
* | --- |
* | "Changing your password runs the full Argon2id stretch, OPRF exchange, and cryptographic key re-wrap pipeline. Your private key is re-encrypted under the new ..." |
*
* @param {Demo_Narrative_Settings_Password_Keys_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_password_keys_body: ((inputs?: Demo_Narrative_Settings_Password_Keys_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Password_Keys_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Password_Keys_BodyInputs = {};
