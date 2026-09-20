/**
* | output |
* | --- |
* | "This form has submissions and cannot be deleted. Deactivate it instead." |
*
* @param {Error_Form_Has_ResponsesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_form_has_responses: ((inputs?: Error_Form_Has_ResponsesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Form_Has_ResponsesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Form_Has_ResponsesInputs = {};
