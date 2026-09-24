/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_GenericInputs */

const en_intake_error_generic = /** @type {(inputs: Intake_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your message didn't go through. Nothing was sent. Try again.`)
};

const es_intake_error_generic = /** @type {(inputs: Intake_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu mensaje no se envió. No se envió nada. Intenta de nuevo.`)
};

const en_xa2_intake_error_generic = /** @type {(inputs: Intake_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr mèssàgè dìdn't gò thròùgh. Nòthìng wàs sènt. Try àgàìn. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your message didn't go through. Nothing was sent. Try again." |
*
* @param {Intake_Error_GenericInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_generic = /** @type {((inputs?: Intake_Error_GenericInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_GenericInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_error_generic(inputs)
	if (locale === "en-XA") return en_xa2_intake_error_generic(inputs)
	return en_intake_error_generic(inputs)
});