/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Footer_PrivacyInputs */

const en_intake_footer_privacy = /** @type {(inputs: Intake_Footer_PrivacyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Privacy notice`)
};

const es_intake_footer_privacy = /** @type {(inputs: Intake_Footer_PrivacyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aviso de privacidad`)
};

/**
* | output |
* | --- |
* | "Privacy notice" |
*
* @param {Intake_Footer_PrivacyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_footer_privacy = /** @type {((inputs?: Intake_Footer_PrivacyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Footer_PrivacyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_footer_privacy(inputs)
	return es_intake_footer_privacy(inputs)
});