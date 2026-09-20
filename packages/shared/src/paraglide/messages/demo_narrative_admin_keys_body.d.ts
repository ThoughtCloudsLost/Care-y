/**
* | output |
* | --- |
* | "The keys section reports the organization key status and provides two operations on it. **Escrow.** The escrow file carries its own KDF parameters, salt, non..." |
*
* @param {Demo_Narrative_Admin_Keys_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_keys_body: ((inputs?: Demo_Narrative_Admin_Keys_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Keys_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Keys_BodyInputs = {};
