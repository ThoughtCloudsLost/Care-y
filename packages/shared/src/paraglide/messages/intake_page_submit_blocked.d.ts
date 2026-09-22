/**
* | output |
* | --- |
* | "Fix all issues before submitting." |
*
* @param {Intake_Page_Submit_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_page_submit_blocked: ((inputs?: Intake_Page_Submit_BlockedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Page_Submit_BlockedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Page_Submit_BlockedInputs = {};
