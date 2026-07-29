/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Categories_HeadingInputs */

const en_demo_narrative_topic_library_categories_heading = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Category management`)
};

const es_demo_narrative_topic_library_categories_heading = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestion de categorias`)
};

/**
* | output |
* | --- |
* | "Category management" |
*
* @param {Demo_Narrative_Topic_Library_Categories_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_categories_heading = /** @type {((inputs?: Demo_Narrative_Topic_Library_Categories_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Categories_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_library_categories_heading(inputs)
	return es_demo_narrative_topic_library_categories_heading(inputs)
});