/**
* | output |
* | --- |
* | "You can interact with this screen in the simulator, which runs against the same in browser database as the rest of the application. Documentation for this ar..." |
*
* @param {Demo_Coming_Soon_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_coming_soon_body: ((inputs?: Demo_Coming_Soon_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Coming_Soon_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Coming_Soon_BodyInputs = {};
