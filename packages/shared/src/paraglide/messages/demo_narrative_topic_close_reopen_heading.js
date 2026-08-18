/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Close_Reopen_HeadingInputs */

const en_demo_narrative_topic_close_reopen_heading = /** @type {(inputs: Demo_Narrative_Topic_Close_Reopen_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closing and reopening`)
};

const es_demo_narrative_topic_close_reopen_heading = /** @type {(inputs: Demo_Narrative_Topic_Close_Reopen_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar y reabrir`)
};

/**
* | output |
* | --- |
* | "Closing and reopening" |
*
* @param {Demo_Narrative_Topic_Close_Reopen_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_close_reopen_heading = /** @type {((inputs?: Demo_Narrative_Topic_Close_Reopen_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Close_Reopen_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_close_reopen_heading(inputs)
	return es_demo_narrative_topic_close_reopen_heading(inputs)
});