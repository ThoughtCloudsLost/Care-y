/**
* | output |
* | --- |
* | "You are signed out on this device, but the server did not confirm it. The session will end on its own within a day." |
*
* @param {Auth_Signout_UnconfirmedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_signout_unconfirmed: ((inputs?: Auth_Signout_UnconfirmedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Signout_UnconfirmedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Signout_UnconfirmedInputs = {};
