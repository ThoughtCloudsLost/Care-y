/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reseed_DoneInputs */

const en_reseed_done = /** @type {(inputs: Reseed_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Message history recovered.`)
};

const es_reseed_done = /** @type {(inputs: Reseed_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Historial de mensajes recuperado.`)
};

/**
* | output |
* | --- |
* | "Message history recovered." |
*
* @param {Reseed_DoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reseed_done = /** @type {((inputs?: Reseed_DoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reseed_DoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reseed_done(inputs)
	return es_reseed_done(inputs)
});