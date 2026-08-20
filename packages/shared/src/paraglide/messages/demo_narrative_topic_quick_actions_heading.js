/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Quick_Actions_HeadingInputs */

const en_demo_narrative_topic_quick_actions_heading = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quick actions`)
};

const es_demo_narrative_topic_quick_actions_heading = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acciones rápidas`)
};

/**
* | output |
* | --- |
* | "Quick actions" |
*
* @param {Demo_Narrative_Topic_Quick_Actions_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_quick_actions_heading = /** @type {((inputs?: Demo_Narrative_Topic_Quick_Actions_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Quick_Actions_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_quick_actions_heading(inputs)
	return es_demo_narrative_topic_quick_actions_heading(inputs)
});