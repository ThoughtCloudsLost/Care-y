/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_SubtextInputs */

const en_onboarding_escrow_subtext = /** @type {(inputs: Onboarding_Escrow_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If you lose access to your admin account, this file is the only way to recover your organization's data.`)
};

const es_onboarding_escrow_subtext = /** @type {(inputs: Onboarding_Escrow_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si pierde el acceso a su cuenta de administrador, este archivo es la unica forma de recuperar los datos de su organizacion.`)
};

/**
* | output |
* | --- |
* | "If you lose access to your admin account, this file is the only way to recover your organization's data." |
*
* @param {Onboarding_Escrow_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_subtext = /** @type {((inputs?: Onboarding_Escrow_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_subtext(inputs)
	return es_onboarding_escrow_subtext(inputs)
});