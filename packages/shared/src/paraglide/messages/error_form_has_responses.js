/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Form_Has_ResponsesInputs */

const en_error_form_has_responses = /** @type {(inputs: Error_Form_Has_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This form has submissions and cannot be deleted. Deactivate it instead.`)
};

const es_error_form_has_responses = /** @type {(inputs: Error_Form_Has_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este formulario tiene respuestas y no se puede eliminar. Desactívalo en su lugar.`)
};

const en_xa2_error_form_has_responses = /** @type {(inputs: Error_Form_Has_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs fòrm hàs sùbmìssìòns ànd cànnòt bè dèlètèd. Dèàctìvàtè ìt ìnstèàd. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This form has submissions and cannot be deleted. Deactivate it instead." |
*
* @param {Error_Form_Has_ResponsesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_form_has_responses = /** @type {((inputs?: Error_Form_Has_ResponsesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Form_Has_ResponsesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_form_has_responses(inputs)
	if (locale === "en-XA") return en_xa2_error_form_has_responses(inputs)
	return en_error_form_has_responses(inputs)
});