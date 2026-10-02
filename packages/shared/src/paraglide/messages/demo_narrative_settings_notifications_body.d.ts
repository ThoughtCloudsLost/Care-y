/**
* | output |
* | --- |
* | "The notification settings let the user choose which channels carry an event by toggling separate switches for push, email and text message. The in-app feed d..." |
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
