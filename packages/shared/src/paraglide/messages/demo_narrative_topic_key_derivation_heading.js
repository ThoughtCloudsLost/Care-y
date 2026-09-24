/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Key_Derivation_HeadingInputs */

const en_demo_narrative_topic_key_derivation_heading = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How encryption keys are derived`)
};

const es_demo_narrative_topic_key_derivation_heading = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cómo se derivan las claves de cifrado`)
};

const en_xa2_demo_narrative_topic_key_derivation_heading = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòw èncryptìòn kèys àrè dèrìvèd ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "How encryption keys are derived" |
*
* @param {Demo_Narrative_Topic_Key_Derivation_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_key_derivation_heading = /** @type {((inputs?: Demo_Narrative_Topic_Key_Derivation_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Key_Derivation_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_key_derivation_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_key_derivation_heading(inputs)
	return en_demo_narrative_topic_key_derivation_heading(inputs)
});