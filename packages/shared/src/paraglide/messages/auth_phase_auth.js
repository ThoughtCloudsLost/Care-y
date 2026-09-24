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

const en_xa2_auth_phase_auth = /** @type {(inputs: Auth_Phase_AuthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vèrìfyìng crèdèntìàls... ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Verifying credentials..." |
*
* @param {Auth_Phase_AuthInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_phase_auth = /** @type {((inputs?: Auth_Phase_AuthInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Phase_AuthInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_phase_auth(inputs)
	if (locale === "en-XA") return en_xa2_auth_phase_auth(inputs)
	return en_auth_phase_auth(inputs)
});