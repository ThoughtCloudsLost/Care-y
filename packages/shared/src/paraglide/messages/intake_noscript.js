/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_NoscriptInputs */

const en_intake_noscript = /** @type {(inputs: Intake_NoscriptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This form needs JavaScript to encrypt your information before sending it. Please enable JavaScript, or call us instead.`)
};

const es_intake_noscript = /** @type {(inputs: Intake_NoscriptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este formulario necesita JavaScript para cifrar tu informacion antes de enviarla. Por favor activa JavaScript, o llamanos en su lugar.`)
};

/**
* | output |
* | --- |
* | "This form needs JavaScript to encrypt your information before sending it. Please enable JavaScript, or call us instead." |
*
* @param {Intake_NoscriptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_noscript = /** @type {((inputs?: Intake_NoscriptInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_NoscriptInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_noscript(inputs)
	return es_intake_noscript(inputs)
});