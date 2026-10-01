/**
* | output |
* | --- |
* | "This takes {fund} to {amount}, below zero. You can still record it." |
*
* @param {Assist_Below_ZeroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_below_zero: ((inputs: Assist_Below_ZeroInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Assist_Below_ZeroInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Assist_Below_ZeroInputs = {
    fund: NonNullable<unknown>;
    amount: NonNullable<unknown>;
};
