/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Reply_HeadingInputs */

const en_demo_narrative_topic_reply_heading = /** @type {(inputs: Demo_Narrative_Topic_Reply_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sending a reply`)
};

const es_demo_narrative_topic_reply_heading = /** @type {(inputs: Demo_Narrative_Topic_Reply_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviando una respuesta`)
};

/**
* | output |
* | --- |
* | "Sending a reply" |
*
* @param {Demo_Narrative_Topic_Reply_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_reply_heading = /** @type {((inputs?: Demo_Narrative_Topic_Reply_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Reply_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_reply_heading(inputs)
	return es_demo_narrative_topic_reply_heading(inputs)
});