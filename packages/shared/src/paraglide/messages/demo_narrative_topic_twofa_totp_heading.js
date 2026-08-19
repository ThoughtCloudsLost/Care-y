/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Totp_HeadingInputs */

const en_demo_narrative_topic_twofa_totp_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Authenticator app codes`)
};

const es_demo_narrative_topic_twofa_totp_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Códigos de aplicación de autenticación`)
};

/**
* | output |
* | --- |
* | "Authenticator app codes" |
*
* @param {Demo_Narrative_Topic_Twofa_Totp_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_totp_heading = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Totp_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Totp_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_twofa_totp_heading(inputs)
	return es_demo_narrative_topic_twofa_totp_heading(inputs)
});