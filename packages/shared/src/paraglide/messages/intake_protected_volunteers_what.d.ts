/**
* | output |
* | --- |
* | "Until a volunteer first opens your case, the organization can unlock what you wrote. From then on, only the volunteers working on your case can read it." |
*
* @param {Intake_Protected_Volunteers_WhatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_protected_volunteers_what: ((inputs?: Intake_Protected_Volunteers_WhatInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Protected_Volunteers_WhatInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Protected_Volunteers_WhatInputs = {};
