/**
* | output |
* | --- |
* | "Form content" |
*
* @param {Intake_Forms_Content_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_content_heading: ((inputs?: Intake_Forms_Content_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Content_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Content_HeadingInputs = {};
