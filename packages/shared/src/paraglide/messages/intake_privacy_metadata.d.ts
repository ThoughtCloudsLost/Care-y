/**
* | output |
* | --- |
* | "Your answer is encrypted, but your selection shares routing metadata with the service." |
*
* @param {Intake_Privacy_MetadataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_metadata: ((inputs?: Intake_Privacy_MetadataInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_MetadataInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_MetadataInputs = {};
