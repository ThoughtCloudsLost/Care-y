/**
* | output |
* | --- |
* | "{Clients}" |
*
* @param {Clients_Page_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_page_title: ((inputs: Clients_Page_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Page_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Page_TitleInputs = {
    Clients: NonNullable<unknown>;
};
