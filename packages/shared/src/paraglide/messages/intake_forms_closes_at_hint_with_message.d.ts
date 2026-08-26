/**
* | output |
* | --- |
* | "After this date, the form shows the closed message instead of accepting submissions." |
*
* @param {Intake_Forms_Closes_At_Hint_With_MessageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closes_at_hint_with_message: ((inputs?: Intake_Forms_Closes_At_Hint_With_MessageInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Closes_At_Hint_With_MessageInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Closes_At_Hint_With_MessageInputs = {};
