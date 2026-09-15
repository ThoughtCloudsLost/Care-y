/**
* | output |
* | --- |
* | "When the organization has published a custom intake form, the intake page shows its configured fields instead of the built-in default. **Conditional fields.*..." |
*
* @param {Demo_Narrative_Client_Intake_Fields_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_fields_body: ((inputs?: Demo_Narrative_Client_Intake_Fields_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Intake_Fields_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Intake_Fields_BodyInputs = {};
