/**
* | output |
* | --- |
* | "The organization's logo, two brand colors, and the text shown to the visitor on the portal are stored as plaintext on the server so pages visited before sign..." |
*
* @param {Demo_Narrative_Admin_Branding_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_branding_body: ((inputs?: Demo_Narrative_Admin_Branding_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Branding_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Branding_BodyInputs = {};
