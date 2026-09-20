/**
* | output |
* | --- |
* | "Used in the shareable URL. Lowercase letters, numbers, and hyphens only." |
*
* @param {Intake_Forms_Slug_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_slug_hint: ((inputs?: Intake_Forms_Slug_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Slug_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Slug_HintInputs = {};
