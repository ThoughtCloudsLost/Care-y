/**
* | output |
* | --- |
* | "Please review the following:" |
*
* @param {Intake_Page_Issues_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_page_issues_heading: ((inputs?: Intake_Page_Issues_HeadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Page_Issues_HeadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Page_Issues_HeadingInputs = {};
