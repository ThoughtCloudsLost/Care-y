/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_ErrorInputs */

const en_onboarding_escrow_error = /** @type {(inputs: Onboarding_Escrow_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to generate escrow file.`)
};

const es_onboarding_escrow_error = /** @type {(inputs: Onboarding_Escrow_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo generar el archivo de custodia.`)
};

/**
* | output |
* | --- |
* | "Failed to generate escrow file." |
*
* @param {Onboarding_Escrow_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_error = /** @type {((inputs?: Onboarding_Escrow_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_error(inputs)
	return es_onboarding_escrow_error(inputs)
});