/**
* | output |
* | --- |
* | "Appears in the app and on {client}-facing pages. Also used as the app icon when saved to a phone's home screen." |
*
* @param {Admin_Branding_Logo_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_hint: ((inputs: Admin_Branding_Logo_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Logo_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Logo_HintInputs = {
    client: NonNullable<unknown>;
    clients: NonNullable<unknown>;
};
