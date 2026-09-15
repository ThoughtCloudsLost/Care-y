/**
* | output |
* | --- |
* | "The account page opens to a sign in form when there is no active session. **How it works.** The password never leaves the device. Signing in derives encrypti..." |
*
* @param {Demo_Narrative_Client_Account_Sign_In_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_sign_in_body: ((inputs?: Demo_Narrative_Client_Account_Sign_In_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Account_Sign_In_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Account_Sign_In_BodyInputs = {};
