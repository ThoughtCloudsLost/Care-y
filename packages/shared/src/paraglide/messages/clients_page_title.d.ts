/**
* | output |
* | --- |
* | "{Clients}" |
*
* @param {Clients_Page_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_page_title: ((inputs: Clients_Page_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Page_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Page_TitleInputs = {
    Clients: NonNullable<unknown>;
};
