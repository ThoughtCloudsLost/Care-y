/**
* | output |
* | --- |
* | "Invite link {index}" |
*
* @param {Admin_Invite_Link_Card_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_card_label: ((inputs: Admin_Invite_Link_Card_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Link_Card_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Link_Card_LabelInputs = {
    index: NonNullable<unknown>;
};
