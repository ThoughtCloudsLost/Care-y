/**
* | output |
* | --- |
* | "Account reset" |
*
* @param {Ticket_Toast_Account_ResetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_account_reset: ((inputs?: Ticket_Toast_Account_ResetInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Account_ResetInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Account_ResetInputs = {};
