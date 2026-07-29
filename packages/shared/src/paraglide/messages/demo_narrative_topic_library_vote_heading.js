/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Vote_HeadingInputs */

const en_demo_narrative_topic_library_vote_heading = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Helpfulness voting`)
};

const es_demo_narrative_topic_library_vote_heading = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Votacion de utilidad`)
};

/**
* | output |
* | --- |
* | "Helpfulness voting" |
*
* @param {Demo_Narrative_Topic_Library_Vote_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_vote_heading = /** @type {((inputs?: Demo_Narrative_Topic_Library_Vote_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Vote_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_library_vote_heading(inputs)
	return es_demo_narrative_topic_library_vote_heading(inputs)
});