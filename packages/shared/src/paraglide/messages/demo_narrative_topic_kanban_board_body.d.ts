/**
* | output |
* | --- |
* | "The Kanban board is one of the ticket list's view modes, selected from the \"View as\" switcher. It arranges tickets as cards in the Grid card style in columns..." |
*
* @param {Demo_Narrative_Topic_Kanban_Board_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_kanban_board_body: ((inputs?: Demo_Narrative_Topic_Kanban_Board_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Kanban_Board_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Kanban_Board_BodyInputs = {};
