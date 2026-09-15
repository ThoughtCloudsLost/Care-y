/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Passkey_HeadingInputs */

const en_demo_narrative_topic_twofa_passkey_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passkeys and security keys`)
};

const es_demo_narrative_topic_twofa_passkey_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passkeys y llaves de seguridad`)
};

/**
* | output |
* | --- |
* | "Passkeys and security keys" |
*
* @param {Demo_Narrative_Topic_Twofa_Passkey_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_passkey_heading = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Passkey_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Passkey_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_passkey_heading(inputs)
	return en_demo_narrative_topic_twofa_passkey_heading(inputs)
});