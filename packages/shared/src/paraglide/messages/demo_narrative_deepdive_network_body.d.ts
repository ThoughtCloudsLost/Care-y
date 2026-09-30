/**
* | output |
* | --- |
* | "All traffic between the browser and the server travels over TLS. Someone watching the connection cannot read the path, page content, request bodies, or API r..." |
*
* @param {Demo_Narrative_Deepdive_Network_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_network_body: ((inputs?: Demo_Narrative_Deepdive_Network_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Deepdive_Network_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Deepdive_Network_BodyInputs = {};
