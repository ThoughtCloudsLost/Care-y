/**
* | output |
* | --- |
* | "An image a client sends by picture message is checked, sealed with the case key and stored as ciphertext, and the thumbnail in the thread is drawn from bytes..." |
*
* @param {Demo_Narrative_Topic_Media_Images_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_media_images_body: ((inputs?: Demo_Narrative_Topic_Media_Images_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Media_Images_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Media_Images_BodyInputs = {};
