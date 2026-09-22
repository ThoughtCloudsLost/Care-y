/**
* | output |
* | --- |
* | "Automatic deletion is off when an organization starts, and turning it on means choosing a window between 1 and 3,650 days, with 365 filled in as a starting p..." |
*
* @param {Demo_Narrative_Admin_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_retention_body: ((inputs?: Demo_Narrative_Admin_Retention_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Retention_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Retention_BodyInputs = {};
