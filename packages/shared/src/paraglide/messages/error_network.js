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

const en_xa2_error_network = /** @type {(inputs: Error_NetworkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt rèàch thè sèrvèr. Chèck yòùr cònnèctìòn. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not reach the server. Check your connection." |
*
* @param {Error_NetworkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_network = /** @type {((inputs?: Error_NetworkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_NetworkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_network(inputs)
	if (locale === "en-XA") return en_xa2_error_network(inputs)
	return en_error_network(inputs)
});