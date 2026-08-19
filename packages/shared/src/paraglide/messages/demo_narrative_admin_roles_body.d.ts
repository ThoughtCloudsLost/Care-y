/**
* | output |
* | --- |
* | "A reference page for each role describes what managers and volunteers can see and do. **Contents.** Each page summarizes the role's permissions, the queues i..." |
*
* @param {Demo_Narrative_Admin_Roles_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_roles_body: ((inputs?: Demo_Narrative_Admin_Roles_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Roles_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Roles_BodyInputs = {};
