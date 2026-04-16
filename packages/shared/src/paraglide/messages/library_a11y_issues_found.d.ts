/**
* | output |
* | --- |
* | "{count} accessibility issues found" |
*
* @param {Library_A11y_Issues_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_a11y_issues_found: ((inputs: Library_A11y_Issues_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_A11y_Issues_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_A11y_Issues_FoundInputs = {
    count: NonNullable<unknown>;
};
