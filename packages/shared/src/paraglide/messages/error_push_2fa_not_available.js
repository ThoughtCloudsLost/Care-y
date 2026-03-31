/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Push_2fa_Not_AvailableInputs */

const en_error_push_2fa_not_available = /** @type {(inputs: Error_Push_2fa_Not_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Push verification is not available. Web Push is not configured.`)
};

const es_error_push_2fa_not_available = /** @type {(inputs: Error_Push_2fa_Not_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La verificación push no está disponible. Web Push no está configurado.`)
};

/**
* | output |
* | --- |
* | "Push verification is not available. Web Push is not configured." |
*
* @param {Error_Push_2fa_Not_AvailableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_push_2fa_not_available = /** @type {((inputs?: Error_Push_2fa_Not_AvailableInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Push_2fa_Not_AvailableInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_push_2fa_not_available(inputs)
	return es_error_push_2fa_not_available(inputs)
});