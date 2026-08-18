/**
* | output |
* | --- |
* | "Your information is encrypted in your browser before it is sent. The server receives only scrambled data it cannot read." |
*
* @param {Intake_Protected_Encrypted_WhatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_encrypted_what: ((inputs?: Intake_Protected_Encrypted_WhatInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Protected_Encrypted_WhatInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Protected_Encrypted_WhatInputs = {};
