/**
* | output |
* | --- |
* | "People" |
*
* @param {Panel_Group_PeopleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_group_people: ((inputs?: Panel_Group_PeopleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Group_PeopleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Group_PeopleInputs = {};
