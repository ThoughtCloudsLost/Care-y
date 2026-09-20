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

const en_xa2_auth_phase_oprf = /** @type {(inputs: Auth_Phase_OprfInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vèrìfyìng wìth sècùrìty sèrvèr... ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Verifying with security server..." |
*
* @param {Auth_Phase_OprfInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_phase_oprf = /** @type {((inputs?: Auth_Phase_OprfInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Phase_OprfInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_phase_oprf(inputs)
	if (locale === "en-XA") return en_xa2_auth_phase_oprf(inputs)
	return en_auth_phase_oprf(inputs)
});