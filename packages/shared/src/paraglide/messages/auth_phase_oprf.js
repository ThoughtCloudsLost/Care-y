/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Phase_OprfInputs */

const en_auth_phase_oprf = /** @type {(inputs: Auth_Phase_OprfInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verifying with security server...`)
};

const es_auth_phase_oprf = /** @type {(inputs: Auth_Phase_OprfInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificando con el servidor de seguridad...`)
};

/**
* | output |
* | --- |
* | "Verifying with security server..." |
*
* @param {Auth_Phase_OprfInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_phase_oprf = /** @type {((inputs?: Auth_Phase_OprfInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Phase_OprfInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_phase_oprf(inputs)
	return es_auth_phase_oprf(inputs)
});