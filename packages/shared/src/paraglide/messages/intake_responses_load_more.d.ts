/**
* | output |
* | --- |
* | "Load more" |
*
* @param {Intake_Responses_Load_MoreInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_load_more: ((inputs?: Intake_Responses_Load_MoreInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Load_MoreInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Load_MoreInputs = {};
