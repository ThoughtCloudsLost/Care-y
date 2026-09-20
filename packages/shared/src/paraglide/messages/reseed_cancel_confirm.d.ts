/**
* | output |
* | --- |
* | "Stopping now keeps what was already recovered. You can finish the rest by generating a new link later." |
*
* @param {Reseed_Cancel_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reseed_cancel_confirm: ((inputs?: Reseed_Cancel_ConfirmInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reseed_Cancel_ConfirmInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reseed_Cancel_ConfirmInputs = {};
