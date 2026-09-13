/**
* | output |
* | --- |
* | "Delete this alert?" |
*
* @param {Escalation_Delete_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_delete_confirm_title: ((inputs?: Escalation_Delete_Confirm_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Delete_Confirm_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Delete_Confirm_TitleInputs = {};
