/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reseed_ErrorInputs */

const en_reseed_error = /** @type {(inputs: Reseed_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recovery failed. You can retry or close and try again later.`)
};

const es_reseed_error = /** @type {(inputs: Reseed_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La recuperación falló. Puedes reintentar o cerrar e intentar de nuevo después.`)
};

const en_xa2_reseed_error = /** @type {(inputs: Reseed_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòvèry fàìlèd. Yòù càn rètry òr clòsè ànd try àgàìn làtèr. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Recovery failed. You can retry or close and try again later." |
*
* @param {Reseed_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reseed_error = /** @type {((inputs?: Reseed_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reseed_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reseed_error(inputs)
	if (locale === "en-XA") return en_xa2_reseed_error(inputs)
	return en_reseed_error(inputs)
});