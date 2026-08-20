/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Unread_Badges_HeadingInputs */

const en_demo_narrative_topic_unread_badges_heading = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unread badges`)
};

const es_demo_narrative_topic_unread_badges_heading = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Insignias de no leídos`)
};

/**
* | output |
* | --- |
* | "Unread badges" |
*
* @param {Demo_Narrative_Topic_Unread_Badges_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_unread_badges_heading = /** @type {((inputs?: Demo_Narrative_Topic_Unread_Badges_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Unread_Badges_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_unread_badges_heading(inputs)
	return es_demo_narrative_topic_unread_badges_heading(inputs)
});