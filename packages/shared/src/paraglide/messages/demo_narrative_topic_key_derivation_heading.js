/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Key_Derivation_HeadingInputs */

const en_demo_narrative_topic_key_derivation_heading = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What a sign-in unlocks`)
};

const es_demo_narrative_topic_key_derivation_heading = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lo que desbloquea un inicio de sesión`)
};

const en_xa2_demo_narrative_topic_key_derivation_heading = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòw èncryptìòn kèys àrè dèrìvèd ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "What a sign-in unlocks" |
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