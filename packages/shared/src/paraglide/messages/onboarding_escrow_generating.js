/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_GeneratingInputs */

const en_onboarding_escrow_generating = /** @type {(inputs: Onboarding_Escrow_GeneratingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generating escrow file...`)
};

const es_onboarding_escrow_generating = /** @type {(inputs: Onboarding_Escrow_GeneratingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generando archivo de custodia...`)
};

/**
* | output |
* | --- |
* | "Generating escrow file..." |
*
* @param {Onboarding_Escrow_GeneratingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_generating = /** @type {((inputs?: Onboarding_Escrow_GeneratingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_GeneratingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_generating(inputs)
	return es_onboarding_escrow_generating(inputs)
});