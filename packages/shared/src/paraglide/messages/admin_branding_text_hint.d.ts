/**
* | output |
* | --- |
* | "Shown on the {client} intake form." |
*
* @param {Admin_Branding_Text_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_text_hint: ((inputs: Admin_Branding_Text_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Text_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Text_HintInputs = {
    client: NonNullable<unknown>;
    clients: NonNullable<unknown>;
};
