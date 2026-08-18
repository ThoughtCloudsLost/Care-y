/**
* | output |
* | --- |
* | "The server stores your information as scrambled data it cannot decode." |
*
* @param {Intake_Protected_Server_WhatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_server_what: ((inputs?: Intake_Protected_Server_WhatInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Protected_Server_WhatInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Protected_Server_WhatInputs = {};
