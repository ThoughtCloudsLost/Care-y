/**
* | output |
* | --- |
* | "The passkey authenticator is simulated in the page. On a real device the authenticator sits outside the browser tab and holds the key itself." |
*
* @param {Demo_Flow_Seam_Webauthn_AuthenticatorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_webauthn_authenticator: ((inputs?: Demo_Flow_Seam_Webauthn_AuthenticatorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Seam_Webauthn_AuthenticatorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Seam_Webauthn_AuthenticatorInputs = {};
