/**
* | output |
* | --- |
* | "Uploading banner..." |
*
* @param {Intake_Forms_Banner_UploadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_uploading: ((inputs?: Intake_Forms_Banner_UploadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Banner_UploadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Banner_UploadingInputs = {};
