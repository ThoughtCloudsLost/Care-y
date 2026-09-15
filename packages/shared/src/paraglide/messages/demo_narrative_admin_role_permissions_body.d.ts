/**
* | output |
* | --- |
* | "The permission matrix on the people page shows which capabilities each role grants, with permissions arranged in a grid grouped by level. **Permission levels..." |
*
* @param {Demo_Narrative_Admin_Role_Permissions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_role_permissions_body: ((inputs?: Demo_Narrative_Admin_Role_Permissions_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Role_Permissions_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Role_Permissions_BodyInputs = {};
