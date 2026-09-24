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

const en_xa2_demo_narrative_topic_quick_actions_heading = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Qùìck àctìòns ••••⟧`)
};

/**
* | output |
* | --- |
* | "Quick actions" |
*
* @param {Demo_Narrative_Topic_Quick_Actions_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_quick_actions_heading = /** @type {((inputs?: Demo_Narrative_Topic_Quick_Actions_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Quick_Actions_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_quick_actions_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_quick_actions_heading(inputs)
	return en_demo_narrative_topic_quick_actions_heading(inputs)
});