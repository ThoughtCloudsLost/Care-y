/**
* | output |
* | --- |
* | "View info for {alias}" |
*
* @param {Ticket_Client_Info_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_client_info_button: ((inputs: Ticket_Client_Info_ButtonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Client_Info_ButtonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Client_Info_ButtonInputs = {
    alias: NonNullable<unknown>;
};
