/**
* | output |
* | --- |
* | "No two-factor methods enrolled. Set up at least one method first." |
*
* @param {Error_No_Methods_EnrolledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_methods_enrolled: ((inputs?: Error_No_Methods_EnrolledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_No_Methods_EnrolledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_No_Methods_EnrolledInputs = {};
