/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Categories_HeadingInputs */

const en_demo_narrative_topic_library_categories_heading = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Category management`)
};

const es_demo_narrative_topic_library_categories_heading = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestión de categorías`)
};

const en_xa2_demo_narrative_topic_library_categories_heading = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càtègòry mànàgèmènt ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Category management" |
*
* @param {Demo_Narrative_Topic_Library_Categories_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_categories_heading = /** @type {((inputs?: Demo_Narrative_Topic_Library_Categories_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Categories_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_library_categories_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_library_categories_heading(inputs)
	return en_demo_narrative_topic_library_categories_heading(inputs)
});