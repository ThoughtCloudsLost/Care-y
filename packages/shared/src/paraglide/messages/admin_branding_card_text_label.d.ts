/**
* | output |
* | --- |
* | "{Client} welcome text" |
*
* @param {Admin_Branding_Card_Text_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_card_text_label: ((inputs: Admin_Branding_Card_Text_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Card_Text_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Card_Text_LabelInputs = {
    Client: NonNullable<unknown>;
    clients: NonNullable<unknown>;
};
