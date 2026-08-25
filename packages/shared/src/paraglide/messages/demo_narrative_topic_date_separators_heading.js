/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Date_Separators_HeadingInputs */

const en_demo_narrative_topic_date_separators_heading = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date separators`)
};

const es_demo_narrative_topic_date_separators_heading = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Separadores de fecha`)
};

/**
* | output |
* | --- |
* | "Date separators" |
*
* @param {Demo_Narrative_Topic_Date_Separators_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_date_separators_heading = /** @type {((inputs?: Demo_Narrative_Topic_Date_Separators_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Date_Separators_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_date_separators_heading(inputs)
	return es_demo_narrative_topic_date_separators_heading(inputs)
});