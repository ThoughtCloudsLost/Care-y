/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Key_Derivation_HeadingInputs */

const en_demo_narrative_topic_key_derivation_heading = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OPRF split-key derivation`)
};

const es_demo_narrative_topic_key_derivation_heading = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Derivacion de clave dividida OPRF`)
};

/**
* | output |
* | --- |
* | "OPRF split-key derivation" |
*
* @param {Demo_Narrative_Topic_Key_Derivation_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_key_derivation_heading = /** @type {((inputs?: Demo_Narrative_Topic_Key_Derivation_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Key_Derivation_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_key_derivation_heading(inputs)
	return es_demo_narrative_topic_key_derivation_heading(inputs)
});