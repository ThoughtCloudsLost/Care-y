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

const en_xa2_intake_footer_privacy = /** @type {(inputs: Intake_Footer_PrivacyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prìvàcy nòtìcè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Privacy notice" |
*
* @param {Intake_Footer_PrivacyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_footer_privacy = /** @type {((inputs?: Intake_Footer_PrivacyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Footer_PrivacyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_footer_privacy(inputs)
	if (locale === "en-XA") return en_xa2_intake_footer_privacy(inputs)
	return en_intake_footer_privacy(inputs)
});