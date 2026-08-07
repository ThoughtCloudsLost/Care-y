/**
* | output |
* | --- |
* | "We texted a code to ***{tail}" |
*
* @param {Consultant_Phone_Code_Sent_ToInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_code_sent_to: ((inputs: Consultant_Phone_Code_Sent_ToInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Code_Sent_ToInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Code_Sent_ToInputs = {
    tail: NonNullable<unknown>;
};
