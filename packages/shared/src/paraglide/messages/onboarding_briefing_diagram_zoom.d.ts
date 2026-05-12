/**
* | output |
* | --- |
* | "Pinch to zoom, tap background to close" |
*
* @param {Onboarding_Briefing_Diagram_ZoomInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_diagram_zoom: ((inputs?: Onboarding_Briefing_Diagram_ZoomInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Diagram_ZoomInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Diagram_ZoomInputs = {};
