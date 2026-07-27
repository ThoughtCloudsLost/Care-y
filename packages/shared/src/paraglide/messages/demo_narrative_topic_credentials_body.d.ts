/**
* | output |
* | --- |
* | "You type a username and password. The password never leaves your device in its original form. CARE-Y runs Argon2id, a memory-hard key stretching function, to..." |
*
* @param {Demo_Narrative_Topic_Credentials_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_credentials_body: ((inputs?: Demo_Narrative_Topic_Credentials_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Credentials_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Credentials_BodyInputs = {};
