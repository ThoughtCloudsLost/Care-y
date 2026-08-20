/**
* | output |
* | --- |
* | "Here is your private message link: {link}" |
*
* @param {Portal_Link_Sms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_link_sms_body: ((inputs: Portal_Link_Sms_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Link_Sms_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Link_Sms_BodyInputs = {
    link: NonNullable<unknown>;
};
