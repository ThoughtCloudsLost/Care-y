/**
* | output |
* | --- |
* | "Alt text (optional, leave blank for decorative)" |
*
* @param {Intake_Forms_Banner_Alt_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_alt_label: ((inputs?: Intake_Forms_Banner_Alt_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Banner_Alt_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Banner_Alt_LabelInputs = {};
