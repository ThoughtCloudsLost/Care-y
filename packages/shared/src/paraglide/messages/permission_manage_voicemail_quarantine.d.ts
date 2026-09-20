/**
* | output |
* | --- |
* | "Manage voicemail quarantine" |
*
* @param {Permission_Manage_Voicemail_QuarantineInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_voicemail_quarantine: ((inputs?: Permission_Manage_Voicemail_QuarantineInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Voicemail_QuarantineInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Voicemail_QuarantineInputs = {};
