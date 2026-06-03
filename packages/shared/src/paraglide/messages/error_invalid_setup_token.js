/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Invalid_Setup_TokenInputs */

const en_error_invalid_setup_token = /** @type {(inputs: Error_Invalid_Setup_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The setup token is invalid or has already been used.`)
};

const es_error_invalid_setup_token = /** @type {(inputs: Error_Invalid_Setup_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El token de configuración es inválido o ya fue utilizado.`)
};

/**
* | output |
* | --- |
* | "The setup token is invalid or has already been used." |
*
* @param {Error_Invalid_Setup_TokenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_invalid_setup_token = /** @type {((inputs?: Error_Invalid_Setup_TokenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Invalid_Setup_TokenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_invalid_setup_token(inputs)
	return es_error_invalid_setup_token(inputs)
});