/**
* | output |
* | --- |
* | "Branding holds the organization's logo, its two brand colors, the welcome text a visitor reads on the intake form, and the support label a client sees on por..." |
*
* @param {Demo_Narrative_Admin_Branding_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_branding_body: ((inputs?: Demo_Narrative_Admin_Branding_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Branding_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Branding_BodyInputs = {};
