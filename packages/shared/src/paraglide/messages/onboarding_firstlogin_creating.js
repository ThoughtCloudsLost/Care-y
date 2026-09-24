/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_CreatingInputs */

const en_onboarding_firstlogin_creating = /** @type {(inputs: Onboarding_Firstlogin_CreatingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creating account...`)
};

const es_onboarding_firstlogin_creating = /** @type {(inputs: Onboarding_Firstlogin_CreatingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creando cuenta...`)
};

const en_xa2_onboarding_firstlogin_creating = /** @type {(inputs: Onboarding_Firstlogin_CreatingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtìng àccòùnt... ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Creating account..." |
*
* @param {Onboarding_Firstlogin_CreatingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_creating = /** @type {((inputs?: Onboarding_Firstlogin_CreatingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_CreatingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_firstlogin_creating(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_firstlogin_creating(inputs)
	return en_onboarding_firstlogin_creating(inputs)
});