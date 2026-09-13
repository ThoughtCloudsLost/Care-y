/**
* | output |
* | --- |
* | "View responses" |
*
* @param {Intake_Responses_View_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_view_label: ((inputs?: Intake_Responses_View_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_View_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_View_LabelInputs = {};
