/**
* | output |
* | --- |
* | "The amount counts toward the fund balance the whole team sees. The note stays with the {ticket}. Fund auditors can open this {ticket} from the fund's history." |
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
