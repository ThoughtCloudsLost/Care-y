/**
* | output |
* | --- |
* | "Your data is collected by {orgName}, supported by the CARE-Y platform operator." |
*
* @param {Intake_Privacy_Who_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_who_body: ((inputs: Intake_Privacy_Who_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Who_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Who_BodyInputs = {
    orgName: NonNullable<unknown>;
};
