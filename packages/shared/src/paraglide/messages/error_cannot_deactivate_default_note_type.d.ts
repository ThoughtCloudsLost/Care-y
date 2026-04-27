/**
* | output |
* | --- |
* | "The default note type cannot be deactivated." |
*
* @param {Error_Cannot_Deactivate_Default_Note_TypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_cannot_deactivate_default_note_type: ((inputs?: Error_Cannot_Deactivate_Default_Note_TypeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Cannot_Deactivate_Default_Note_TypeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Cannot_Deactivate_Default_Note_TypeInputs = {};
