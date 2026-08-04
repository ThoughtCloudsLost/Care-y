/**
* | output |
* | --- |
* | "{ms} ms" |
*
* @param {Demo_Flow_Duration_MsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_duration_ms: ((inputs: Demo_Flow_Duration_MsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Duration_MsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Duration_MsInputs = {
    ms: NonNullable<unknown>;
};
