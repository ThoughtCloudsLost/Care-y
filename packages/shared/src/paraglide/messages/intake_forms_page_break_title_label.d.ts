/**
* | output |
* | --- |
* | "Page title (optional)" |
*
* @param {Intake_Forms_Page_Break_Title_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_page_break_title_label: ((inputs?: Intake_Forms_Page_Break_Title_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Page_Break_Title_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Page_Break_Title_LabelInputs = {};
