/**
* | output |
* | --- |
* | "Kanban board" |
*
* @param {View_Switcher_KanbanInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const view_switcher_kanban: ((inputs?: View_Switcher_KanbanInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<View_Switcher_KanbanInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type View_Switcher_KanbanInputs = {};
