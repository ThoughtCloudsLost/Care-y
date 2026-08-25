/**
* | output |
* | --- |
* | "Photos that clients text in over MMS are stored as encrypted binary on the server and decrypted in the browser before a thumbnail appears in the thread. Tapp..." |
*
* @param {Demo_Narrative_Topic_Media_Images_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_media_images_body: ((inputs?: Demo_Narrative_Topic_Media_Images_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Media_Images_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Media_Images_BodyInputs = {};
