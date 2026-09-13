/**
* | output |
* | --- |
* | "Banner image" |
*
* @param {Intake_Forms_Banner_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_heading: ((inputs?: Intake_Forms_Banner_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Banner_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Banner_HeadingInputs = {};
