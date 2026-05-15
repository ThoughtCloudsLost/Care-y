/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Error_Invalid_StateInputs */

const en_twofa_error_invalid_state = /** @type {(inputs: Twofa_Error_Invalid_StateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This authenticator is already registered.`)
};

const es_twofa_error_invalid_state = /** @type {(inputs: Twofa_Error_Invalid_StateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este autenticador ya está registrado.`)
};

/**
* | output |
* | --- |
* | "This authenticator is already registered." |
*
* @param {Twofa_Error_Invalid_StateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_error_invalid_state = /** @type {((inputs?: Twofa_Error_Invalid_StateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_Invalid_StateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_error_invalid_state(inputs)
	return es_twofa_error_invalid_state(inputs)
});