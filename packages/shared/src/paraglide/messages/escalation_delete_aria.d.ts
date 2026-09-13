/**
* | output |
* | --- |
* | "Delete rule: {rule}" |
*
* @param {Escalation_Delete_AriaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_delete_aria: ((inputs: Escalation_Delete_AriaInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Delete_AriaInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Delete_AriaInputs = {
    rule: NonNullable<unknown>;
};
