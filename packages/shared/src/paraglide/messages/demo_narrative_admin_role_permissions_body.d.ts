/**
* | output |
* | --- |
* | "The matrix lists every permission against each of the three roles, grouped by the area of work each permission governs. An organization can move most permiss..." |
*
* @param {Demo_Narrative_Admin_Role_Permissions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_role_permissions_body: ((inputs?: Demo_Narrative_Admin_Role_Permissions_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Role_Permissions_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Role_Permissions_BodyInputs = {};
