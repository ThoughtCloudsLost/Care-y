/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Telephony_Relay_HeadingInputs */

const en_demo_narrative_deepdive_telephony_relay_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Telephony_Relay_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The telephony relay`)
};

const es_demo_narrative_deepdive_telephony_relay_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Telephony_Relay_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El relay de telefonía`)
};

/**
* | output |
* | --- |
* | "The telephony relay" |
*
* @param {Demo_Narrative_Deepdive_Telephony_Relay_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_telephony_relay_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_Telephony_Relay_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Telephony_Relay_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_telephony_relay_heading(inputs)
	return en_demo_narrative_deepdive_telephony_relay_heading(inputs)
});