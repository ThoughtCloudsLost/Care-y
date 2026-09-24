/**
* | output |
* | --- |
* | "You do not have a key wrap for this submission. Another key holder can unlock it for you by viewing this page." |
*
* @param {Intake_Responses_Key_Not_Held_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_key_not_held_hint: ((inputs?: Intake_Responses_Key_Not_Held_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Key_Not_Held_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Key_Not_Held_HintInputs = {};
