/**
* | output |
* | --- |
* | "The default intake form is not available." |
*
* @param {Error_Builtin_Form_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_builtin_form_disabled: ((inputs?: Error_Builtin_Form_DisabledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Builtin_Form_DisabledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Builtin_Form_DisabledInputs = {};
