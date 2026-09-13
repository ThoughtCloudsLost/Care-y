/**
* | output |
* | --- |
* | "Uploading banner..." |
*
* @param {Intake_Forms_Banner_UploadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_uploading: ((inputs?: Intake_Forms_Banner_UploadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Banner_UploadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Banner_UploadingInputs = {};
