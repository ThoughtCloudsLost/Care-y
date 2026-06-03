/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Phase_PowInputs */

const en_auth_phase_pow = /** @type {(inputs: Auth_Phase_PowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Completing verification...`)
};

const es_auth_phase_pow = /** @type {(inputs: Auth_Phase_PowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Completando verificación...`)
};

/**
* | output |
* | --- |
* | "Completing verification..." |
*
* @param {Auth_Phase_PowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_phase_pow = /** @type {((inputs?: Auth_Phase_PowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Phase_PowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_phase_pow(inputs)
	return es_auth_phase_pow(inputs)
});