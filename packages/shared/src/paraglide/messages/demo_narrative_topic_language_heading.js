/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Language_HeadingInputs */

const en_demo_narrative_topic_language_heading = /** @type {(inputs: Demo_Narrative_Topic_Language_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Language selection`)
};

const es_demo_narrative_topic_language_heading = /** @type {(inputs: Demo_Narrative_Topic_Language_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccion de idioma`)
};

/**
* | output |
* | --- |
* | "Language selection" |
*
* @param {Demo_Narrative_Topic_Language_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_language_heading = /** @type {((inputs?: Demo_Narrative_Topic_Language_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Language_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_language_heading(inputs)
	return es_demo_narrative_topic_language_heading(inputs)
});