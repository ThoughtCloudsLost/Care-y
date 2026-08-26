/**
* | output |
* | --- |
* | "Step {current} of {total}" |
*
* @param {Intake_Page_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_page_progress: ((inputs: Intake_Page_ProgressInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Page_ProgressInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Page_ProgressInputs = {
    current: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
