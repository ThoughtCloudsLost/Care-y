/**
* | output |
* | --- |
* | "Content exceeds the {max} character limit for this locale." |
*
* @param {Intake_Forms_Content_Cap_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_content_cap_error: ((inputs: Intake_Forms_Content_Cap_ErrorInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Content_Cap_ErrorInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Content_Cap_ErrorInputs = {
    max: NonNullable<unknown>;
};
