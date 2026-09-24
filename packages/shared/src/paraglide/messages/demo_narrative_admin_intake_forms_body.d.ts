/**
* | output |
* | --- |
* | "The intake forms list holds every form an organization has built, and one switch beside it takes web intake off for the whole organization at once. [[#portal..." |
*
* @param {Demo_Narrative_Admin_Intake_Forms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_intake_forms_body: ((inputs?: Demo_Narrative_Admin_Intake_Forms_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Intake_Forms_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Intake_Forms_BodyInputs = {};
