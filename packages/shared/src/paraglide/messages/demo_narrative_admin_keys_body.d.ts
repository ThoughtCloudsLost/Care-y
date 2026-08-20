/**
* | output |
* | --- |
* | "The keys section shows the organization key status and provides escrow export. **Escrow.** The escrow flow creates a passphrase protected file (minimum 20 ch..." |
*
* @param {Demo_Narrative_Admin_Keys_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_keys_body: ((inputs?: Demo_Narrative_Admin_Keys_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Keys_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Keys_BodyInputs = {};
