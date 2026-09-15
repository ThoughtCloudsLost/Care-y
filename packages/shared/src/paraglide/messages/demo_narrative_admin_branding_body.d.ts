/**
* | output |
* | --- |
* | "Organization name, primary and accent colors, logo, and client facing text are stored as plaintext on the server so pre auth pages can display them without d..." |
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
