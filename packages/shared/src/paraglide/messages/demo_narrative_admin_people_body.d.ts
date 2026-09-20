/**
* | output |
* | --- |
* | "The roster shows every user in the organization with their role and assigned queues. **Role management.** Each user holds one of three roles. The first two r..." |
*
* @param {Demo_Narrative_Admin_People_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_people_body: ((inputs?: Demo_Narrative_Admin_People_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_People_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_People_BodyInputs = {};
