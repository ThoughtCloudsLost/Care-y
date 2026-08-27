/**
* | output |
* | --- |
* | "Banner image exceeds the maximum file size." |
*
* @param {Intake_Forms_Banner_File_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_file_too_large: ((inputs?: Intake_Forms_Banner_File_Too_LargeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Banner_File_Too_LargeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Banner_File_Too_LargeInputs = {};
