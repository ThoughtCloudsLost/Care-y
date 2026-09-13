/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Form_Has_ResponsesInputs */

const en_error_form_has_responses = /** @type {(inputs: Error_Form_Has_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This form has submissions and cannot be deleted. Deactivate it instead.`)
};

const es_error_form_has_responses = /** @type {(inputs: Error_Form_Has_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este formulario tiene respuestas y no se puede eliminar. Desactivalo en su lugar.`)
};

/**
* | output |
* | --- |
* | "This form has submissions and cannot be deleted. Deactivate it instead." |
*
* @param {Error_Form_Has_ResponsesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_form_has_responses = /** @type {((inputs?: Error_Form_Has_ResponsesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Form_Has_ResponsesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_form_has_responses(inputs)
	return es_error_form_has_responses(inputs)
});