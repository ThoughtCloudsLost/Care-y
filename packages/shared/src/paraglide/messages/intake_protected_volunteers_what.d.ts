/**
* | output |
* | --- |
* | "Only volunteers assigned to your case can read your information." |
*
* @param {Intake_Protected_Volunteers_WhatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_volunteers_what: ((inputs?: Intake_Protected_Volunteers_WhatInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Protected_Volunteers_WhatInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Protected_Volunteers_WhatInputs = {};
