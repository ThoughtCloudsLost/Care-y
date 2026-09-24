/**
* | output |
* | --- |
* | "Delete rule: {rule}" |
*
* @param {Escalation_Delete_AriaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_delete_aria: ((inputs: Escalation_Delete_AriaInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Delete_AriaInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Delete_AriaInputs = {
    rule: NonNullable<unknown>;
};
