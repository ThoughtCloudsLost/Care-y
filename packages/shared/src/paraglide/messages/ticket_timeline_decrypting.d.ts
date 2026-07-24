/**
* | output |
* | --- |
* | "Unlocking message" |
*
* @param {Ticket_Timeline_DecryptingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_decrypting: ((inputs?: Ticket_Timeline_DecryptingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_DecryptingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_DecryptingInputs = {};
