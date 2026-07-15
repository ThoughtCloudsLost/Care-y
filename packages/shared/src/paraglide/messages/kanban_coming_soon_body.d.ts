/**
* | output |
* | --- |
* | "Drag-and-drop ticket management is on the way." |
*
* @param {Kanban_Coming_Soon_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const kanban_coming_soon_body: ((inputs?: Kanban_Coming_Soon_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Kanban_Coming_Soon_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Kanban_Coming_Soon_BodyInputs = {};
