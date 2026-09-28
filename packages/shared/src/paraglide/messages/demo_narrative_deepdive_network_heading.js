/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Network_HeadingInputs */

const en_demo_narrative_deepdive_network_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Network_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What the network sees`)
};

const es_demo_narrative_deepdive_network_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Network_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lo que ve la red`)
};

const en_xa2_demo_narrative_deepdive_network_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Network_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whàt thè nètwòrk sèès •••••••⟧`)
};

/**
* | output |
* | --- |
* | "What the network sees" |
*
* @param {Demo_Narrative_Deepdive_Network_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_network_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_Network_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Network_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_network_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_deepdive_network_heading(inputs)
	return en_demo_narrative_deepdive_network_heading(inputs)
});