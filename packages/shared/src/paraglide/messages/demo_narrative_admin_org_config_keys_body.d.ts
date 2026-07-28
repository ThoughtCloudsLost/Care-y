/**
* | output |
* | --- |
* | "The organization page has six sections: general info, branding, terminology, retention policy, follow-up types, and encryption keys. Branding and terminology..." |
*
* @param {Demo_Narrative_Admin_Org_Config_Keys_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_org_config_keys_body: ((inputs?: Demo_Narrative_Admin_Org_Config_Keys_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Org_Config_Keys_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Org_Config_Keys_BodyInputs = {};
