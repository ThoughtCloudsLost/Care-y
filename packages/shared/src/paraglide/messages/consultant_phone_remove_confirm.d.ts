/**
* | output |
* | --- |
* | "Your verified phone will be removed. You will not be able to receive callback calls or SMS pings until you register and verify a new number." |
*
* @param {Consultant_Phone_Remove_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_remove_confirm: ((inputs?: Consultant_Phone_Remove_ConfirmInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Remove_ConfirmInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Remove_ConfirmInputs = {};
