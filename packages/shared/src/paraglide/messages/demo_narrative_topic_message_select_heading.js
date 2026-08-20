/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Message_Select_HeadingInputs */

const en_demo_narrative_topic_message_select_heading = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selecting messages`)
};

const es_demo_narrative_topic_message_select_heading = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccionar mensajes`)
};

/**
* | output |
* | --- |
* | "Selecting messages" |
*
* @param {Demo_Narrative_Topic_Message_Select_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_message_select_heading = /** @type {((inputs?: Demo_Narrative_Topic_Message_Select_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Message_Select_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_message_select_heading(inputs)
	return es_demo_narrative_topic_message_select_heading(inputs)
});