/**
* | output |
* | --- |
* | "The rule \"{rule}\" will be removed permanently." |
*
* @param {Escalation_Delete_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_delete_confirm_body: ((inputs: Escalation_Delete_Confirm_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Delete_Confirm_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Delete_Confirm_BodyInputs = {
    rule: NonNullable<unknown>;
};
