/**
* | output |
* | --- |
* | "The view switcher in the page header changes how ticket lists on the dashboard are displayed. **Available modes:** - **Rows** show compact single line entrie..." |
*
* @param {Demo_Narrative_Dashboard_View_Switcher_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_view_switcher_body: ((inputs?: Demo_Narrative_Dashboard_View_Switcher_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_View_Switcher_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_View_Switcher_BodyInputs = {};
