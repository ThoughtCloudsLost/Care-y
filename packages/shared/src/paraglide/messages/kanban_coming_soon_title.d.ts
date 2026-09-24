/**
* | output |
* | --- |
* | "Kanban board" |
*
* @param {Kanban_Coming_Soon_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const kanban_coming_soon_title: ((inputs?: Kanban_Coming_Soon_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Kanban_Coming_Soon_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Kanban_Coming_Soon_TitleInputs = {};
