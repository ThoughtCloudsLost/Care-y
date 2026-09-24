/**
* | output |
* | --- |
* | "Your message didn't go through. Nothing was sent. Try again." |
*
* @param {Intake_Error_GenericInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_generic: ((inputs?: Intake_Error_GenericInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_GenericInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_GenericInputs = {};
