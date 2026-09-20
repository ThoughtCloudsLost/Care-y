/**
* | output |
* | --- |
* | "The notification preferences let the user control which events produce notifications and through which channels, with each combination toggled independently ..." |
*
* @param {Demo_Narrative_Settings_Notifications_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_notifications_body: ((inputs?: Demo_Narrative_Settings_Notifications_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Notifications_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Notifications_BodyInputs = {};
