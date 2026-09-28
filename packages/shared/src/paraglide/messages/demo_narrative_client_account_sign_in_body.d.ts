/**
* | output |
* | --- |
* | "The sign-in form asks for a username and a password. It appears on a first visit, after a reload, and after the idle timeout or a closed tab clears the keys,..." |
*
* @param {Demo_Narrative_Client_Account_Sign_In_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_sign_in_body: ((inputs?: Demo_Narrative_Client_Account_Sign_In_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Account_Sign_In_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Account_Sign_In_BodyInputs = {};
