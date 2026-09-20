/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Language_HeadingInputs */

const en_demo_narrative_topic_language_heading = /** @type {(inputs: Demo_Narrative_Topic_Language_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Language selection`)
};

const es_demo_narrative_topic_language_heading = /** @type {(inputs: Demo_Narrative_Topic_Language_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selección de idioma`)
};

const en_xa2_demo_narrative_topic_language_heading = /** @type {(inputs: Demo_Narrative_Topic_Language_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Làngùàgè sèlèctìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Language selection" |
*
* @param {Demo_Narrative_Topic_Language_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_language_heading = /** @type {((inputs?: Demo_Narrative_Topic_Language_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Language_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_language_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_language_heading(inputs)
	return en_demo_narrative_topic_language_heading(inputs)
});