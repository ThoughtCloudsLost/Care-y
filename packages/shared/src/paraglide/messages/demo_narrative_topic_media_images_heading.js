/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Media_Images_HeadingInputs */

const en_demo_narrative_topic_media_images_heading = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Photos and MMS`)
};

const es_demo_narrative_topic_media_images_heading = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fotos y MMS`)
};

const en_xa2_demo_narrative_topic_media_images_heading = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phòtòs ànd MMS •••••⟧`)
};

/**
* | output |
* | --- |
* | "Photos and MMS" |
*
* @param {Demo_Narrative_Topic_Media_Images_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_media_images_heading = /** @type {((inputs?: Demo_Narrative_Topic_Media_Images_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Media_Images_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_media_images_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_media_images_heading(inputs)
	return en_demo_narrative_topic_media_images_heading(inputs)
});