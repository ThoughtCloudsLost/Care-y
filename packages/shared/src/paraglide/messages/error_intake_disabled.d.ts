/**
* | output |
* | --- |
* | "Web intake is currently turned off." |
*
* @param {Error_Intake_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_intake_disabled: ((inputs?: Error_Intake_DisabledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Intake_DisabledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Intake_DisabledInputs = {};
