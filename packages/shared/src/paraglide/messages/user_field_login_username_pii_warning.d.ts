/**
* | output |
* | --- |
* | "The server can never read login usernames, but signing in uses a per-organization fingerprint of the username, so someone holding the database could confirm ..." |
*
* @param {User_Field_Login_Username_Pii_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const user_field_login_username_pii_warning: ((inputs?: User_Field_Login_Username_Pii_WarningInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<User_Field_Login_Username_Pii_WarningInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type User_Field_Login_Username_Pii_WarningInputs = {};
