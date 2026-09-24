/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ done: NonNullable<unknown>, total: NonNullable<unknown> }} Reseed_ProgressInputs */

const en_reseed_progress = /** @type {(inputs: Reseed_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Recovering messages: ${i?.done} of ${i?.total}`)
};

const es_reseed_progress = /** @type {(inputs: Reseed_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Recuperando mensajes: ${i?.done} de ${i?.total}`)
};

const en_xa2_reseed_progress = /** @type {(inputs: Reseed_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rècòvèrìng mèssàgès:  •••••••${i?.done} òf  ••${i?.total}⟧`)
};

/**
* | output |
* | --- |
* | "Recovering messages: {done} of {total}" |
*
* @param {Reseed_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reseed_progress = /** @type {((inputs: Reseed_ProgressInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reseed_ProgressInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reseed_progress(inputs)
	if (locale === "en-XA") return en_xa2_reseed_progress(inputs)
	return en_reseed_progress(inputs)
});