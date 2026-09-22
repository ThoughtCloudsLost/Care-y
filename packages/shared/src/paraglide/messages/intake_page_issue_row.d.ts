/**
* | output |
* | --- |
* | "{field}: {error}" |
*
* @param {Intake_Page_Issue_RowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_page_issue_row: ((inputs: Intake_Page_Issue_RowInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Page_Issue_RowInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Page_Issue_RowInputs = {
    field: NonNullable<unknown>;
    error: NonNullable<unknown>;
};
