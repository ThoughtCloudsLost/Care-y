/**
* | output |
* | --- |
* | "Save" |
*
* @param {Escalation_Save_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_save_button: ((inputs?: Escalation_Save_ButtonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Save_ButtonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Save_ButtonInputs = {};
