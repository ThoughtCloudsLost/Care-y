/**
* | output |
* | --- |
* | "Phone calls and text messages are the one part of CARE-Y where plaintext has to exist on the server, because a phone number and a message body have to be han..." |
*
* @param {Demo_Narrative_Deepdive_Telephony_Relay_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_telephony_relay_body: ((inputs?: Demo_Narrative_Deepdive_Telephony_Relay_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Deepdive_Telephony_Relay_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Deepdive_Telephony_Relay_BodyInputs = {};
