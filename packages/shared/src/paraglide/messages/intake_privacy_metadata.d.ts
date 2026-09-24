/**
* | output |
* | --- |
* | "Your answer is encrypted, but your selection shares routing metadata with the service." |
*
* @param {Intake_Privacy_MetadataInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_metadata: ((inputs?: Intake_Privacy_MetadataInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_MetadataInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_MetadataInputs = {};
