/**
* | output |
* | --- |
* | "Banner upload failed." |
*
* @param {Intake_Forms_Banner_Upload_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_upload_failed: ((inputs?: Intake_Forms_Banner_Upload_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Banner_Upload_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Banner_Upload_FailedInputs = {};
