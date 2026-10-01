/**
* | output |
* | --- |
* | "The amount counts toward the fund balance the whole team sees. The note, and the fact that this {ticket} received it, stay with the {ticket}." |
*
* @param {Assist_VisibilityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_visibility: ((inputs: Assist_VisibilityInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Assist_VisibilityInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Assist_VisibilityInputs = {
    ticket: NonNullable<unknown>;
};
