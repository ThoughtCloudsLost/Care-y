/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Delete_Has_ResponsesInputs */

const en_intake_forms_delete_has_responses = /** @type {(inputs: Intake_Forms_Delete_Has_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This form has been used for intake submissions and cannot be deleted. You can deactivate it instead.`)
};

const es_intake_forms_delete_has_responses = /** @type {(inputs: Intake_Forms_Delete_Has_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este formulario ha sido usado para envios de admision y no se puede eliminar. Puedes desactivarlo en su lugar.`)
};

/**
* | output |
* | --- |
* | "This form has been used for intake submissions and cannot be deleted. You can deactivate it instead." |
*
* @param {Intake_Forms_Delete_Has_ResponsesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_delete_has_responses = /** @type {((inputs?: Intake_Forms_Delete_Has_ResponsesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Delete_Has_ResponsesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_delete_has_responses(inputs)
	return es_intake_forms_delete_has_responses(inputs)
});