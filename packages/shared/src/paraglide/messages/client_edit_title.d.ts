/**
* | output |
* | --- |
* | "Edit {Client}" |
*
* @param {Client_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_edit_title: ((inputs: Client_Edit_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Edit_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Edit_TitleInputs = {
    Client: NonNullable<unknown>;
};
