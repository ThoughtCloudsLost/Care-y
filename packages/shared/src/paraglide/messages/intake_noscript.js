/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_NoscriptInputs */

const en_intake_noscript = /** @type {(inputs: Intake_NoscriptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This form needs JavaScript to encrypt your information before sending it. Please enable JavaScript, or call us instead.`)
};

const es_intake_noscript = /** @type {(inputs: Intake_NoscriptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este formulario necesita JavaScript para cifrar tu información antes de enviarla. Por favor activa JavaScript, o llamanos en su lugar.`)
};

const en_xa2_intake_noscript = /** @type {(inputs: Intake_NoscriptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs fòrm nèèds JàvàScrìpt tò èncrypt yòùr ìnfòrmàtìòn bèfòrè sèndìng ìt. Plèàsè ènàblè JàvàScrìpt, òr càll ùs ìnstèàd. ••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This form needs JavaScript to encrypt your information before sending it. Please enable JavaScript, or call us instead." |
*
* @param {Intake_NoscriptInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_noscript = /** @type {((inputs?: Intake_NoscriptInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_NoscriptInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_noscript(inputs)
	if (locale === "en-XA") return en_xa2_intake_noscript(inputs)
	return en_intake_noscript(inputs)
});