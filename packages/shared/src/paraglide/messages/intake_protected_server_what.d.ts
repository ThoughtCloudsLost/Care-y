/**
* | output |
* | --- |
* | "The server stores your information as scrambled data it cannot decode." |
*
* @param {Intake_Protected_Server_WhatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_protected_server_what: ((inputs?: Intake_Protected_Server_WhatInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Protected_Server_WhatInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Protected_Server_WhatInputs = {};
