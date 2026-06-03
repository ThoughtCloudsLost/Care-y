/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Phase_AuthInputs */

const en_auth_phase_auth = /** @type {(inputs: Auth_Phase_AuthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verifying credentials...`)
};

const es_auth_phase_auth = /** @type {(inputs: Auth_Phase_AuthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificando credenciales...`)
};

/**
* | output |
* | --- |
* | "Verifying credentials..." |
*
* @param {Auth_Phase_AuthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_phase_auth = /** @type {((inputs?: Auth_Phase_AuthInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Phase_AuthInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_phase_auth(inputs)
	return es_auth_phase_auth(inputs)
});