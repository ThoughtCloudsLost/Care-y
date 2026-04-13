/**
* | output |
* | --- |
* | "View info for {alias}" |
*
* @param {Ticket_Client_Info_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_client_info_button: ((inputs: Ticket_Client_Info_ButtonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Client_Info_ButtonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Client_Info_ButtonInputs = {
    alias: NonNullable<unknown>;
};
