/**
* | output |
* | --- |
* | "Turning this on stores your number so the server can text you when activity happens. If you leave it off, SMS pings will arrive as email instead." |
*
* @param {Consultant_Phone_Sms_Pings_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_sms_pings_explainer: ((inputs?: Consultant_Phone_Sms_Pings_ExplainerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Sms_Pings_ExplainerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Sms_Pings_ExplainerInputs = {};
