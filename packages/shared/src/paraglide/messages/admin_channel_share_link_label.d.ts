/**
* | output |
* | --- |
* | "One-time share links" |
*
* @param {Admin_Channel_Share_Link_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_share_link_label: ((inputs?: Admin_Channel_Share_Link_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Channel_Share_Link_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Channel_Share_Link_LabelInputs = {};
