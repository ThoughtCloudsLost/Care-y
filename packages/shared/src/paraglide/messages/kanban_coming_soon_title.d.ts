/**
* | output |
* | --- |
* | "Kanban board" |
*
* @param {Kanban_Coming_Soon_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const kanban_coming_soon_title: ((inputs?: Kanban_Coming_Soon_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Kanban_Coming_Soon_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Kanban_Coming_Soon_TitleInputs = {};
