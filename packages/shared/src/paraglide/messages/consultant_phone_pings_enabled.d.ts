/**
* | output |
* | --- |
* | "SMS pings enabled" |
*
* @param {Consultant_Phone_Pings_EnabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_pings_enabled: ((inputs?: Consultant_Phone_Pings_EnabledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Pings_EnabledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Pings_EnabledInputs = {};
