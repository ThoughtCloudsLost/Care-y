/**
* | output |
* | --- |
* | "Step {page}: {field}: {error}" |
*
* @param {Intake_Page_Issue_Row_With_PageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_page_issue_row_with_page: ((inputs: Intake_Page_Issue_Row_With_PageInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Page_Issue_Row_With_PageInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Page_Issue_Row_With_PageInputs = {
    page: NonNullable<unknown>;
    field: NonNullable<unknown>;
    error: NonNullable<unknown>;
};
