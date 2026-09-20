/**
* | output |
* | --- |
* | "A previous password change did not finish. Enter your current password to complete the key rotation." |
*
* @param {Settings_Password_Recovery_PromptInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_recovery_prompt: ((inputs?: Settings_Password_Recovery_PromptInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Password_Recovery_PromptInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Password_Recovery_PromptInputs = {};
