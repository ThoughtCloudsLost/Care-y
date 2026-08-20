/**
* | output |
* | --- |
* | "The roster shows every volunteer in the organization with their role and assigned queues. **Role management.** Each volunteer has one of three roles: Volunte..." |
*
* @param {Demo_Narrative_Admin_People_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_people_body: ((inputs?: Demo_Narrative_Admin_People_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_People_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_People_BodyInputs = {};
