/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_NetworkInputs */

const en_error_network = /** @type {(inputs: Error_NetworkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not reach the server. Check your connection.`)
};

const es_error_network = /** @type {(inputs: Error_NetworkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo conectar con el servidor. Verifica tu conexión.`)
};

/**
* | output |
* | --- |
* | "Could not reach the server. Check your connection." |
*
* @param {Error_NetworkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_network = /** @type {((inputs?: Error_NetworkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_NetworkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_network(inputs)
	return es_error_network(inputs)
});