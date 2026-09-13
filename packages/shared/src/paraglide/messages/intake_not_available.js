/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Not_AvailableInputs */

const en_intake_not_available = /** @type {(inputs: Intake_Not_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This form is not available. If you need help, contact the organization directly.`)
};

const es_intake_not_available = /** @type {(inputs: Intake_Not_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este formulario no esta disponible. Si necesita ayuda, comuniquese directamente con la organizacion.`)
};

/**
* | output |
* | --- |
* | "This form is not available. If you need help, contact the organization directly." |
*
* @param {Intake_Not_AvailableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_not_available = /** @type {((inputs?: Intake_Not_AvailableInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Not_AvailableInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_not_available(inputs)
	return es_intake_not_available(inputs)
});