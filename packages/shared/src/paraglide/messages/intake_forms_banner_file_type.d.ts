/**
* | output |
* | --- |
* | "Only PNG, JPEG, and WebP images are allowed." |
*
* @param {Intake_Forms_Banner_File_TypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_file_type: ((inputs?: Intake_Forms_Banner_File_TypeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Banner_File_TypeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Banner_File_TypeInputs = {};
