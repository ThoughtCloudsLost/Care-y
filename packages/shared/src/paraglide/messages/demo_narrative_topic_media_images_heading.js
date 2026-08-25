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

/**
* | output |
* | --- |
* | "Photos and MMS" |
*
* @param {Demo_Narrative_Topic_Media_Images_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_media_images_heading = /** @type {((inputs?: Demo_Narrative_Topic_Media_Images_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Media_Images_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_media_images_heading(inputs)
	return es_demo_narrative_topic_media_images_heading(inputs)
});