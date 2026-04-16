/**
* | output |
* | --- |
* | "No accessibility issues" |
*
* @param {Library_A11y_No_IssuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_a11y_no_issues: ((inputs?: Library_A11y_No_IssuesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_A11y_No_IssuesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_A11y_No_IssuesInputs = {};
