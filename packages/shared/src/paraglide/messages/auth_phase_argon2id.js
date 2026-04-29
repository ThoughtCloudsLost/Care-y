/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Phase_Argon2idInputs */

const en_auth_phase_argon2id = /** @type {(inputs: Auth_Phase_Argon2idInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Deriving encryption keys...`)
};

const es_auth_phase_argon2id = /** @type {(inputs: Auth_Phase_Argon2idInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Derivando claves de cifrado...`)
};

/**
* | output |
* | --- |
* | "Deriving encryption keys..." |
*
* @param {Auth_Phase_Argon2idInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_phase_argon2id = /** @type {((inputs?: Auth_Phase_Argon2idInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Phase_Argon2idInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_phase_argon2id(inputs)
	return es_auth_phase_argon2id(inputs)
});