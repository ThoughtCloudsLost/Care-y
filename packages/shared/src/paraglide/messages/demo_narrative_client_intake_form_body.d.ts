/**
* | output |
* | --- |
* | "The intake form is the first thing a person seeking help sees, and no login or account is needed to use it. **Quick exit.** The quick exit control is rendere..." |
*
* @param {Demo_Narrative_Client_Intake_Form_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_form_body: ((inputs?: Demo_Narrative_Client_Intake_Form_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Intake_Form_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Intake_Form_BodyInputs = {};
