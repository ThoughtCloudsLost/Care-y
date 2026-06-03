/**
* | output |
* | --- |
* | "Waiting for approval..." |
*
* @param {Twofa_Push_WaitingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_push_waiting: ((inputs?: Twofa_Push_WaitingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Push_WaitingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Push_WaitingInputs = {};
