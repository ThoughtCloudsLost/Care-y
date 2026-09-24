/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Delete_Has_ResponsesInputs */

const en_intake_forms_delete_has_responses = /** @type {(inputs: Intake_Forms_Delete_Has_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This form has been used for intake submissions and cannot be deleted. You can deactivate it instead.`)
};

const es_intake_forms_delete_has_responses = /** @type {(inputs: Intake_Forms_Delete_Has_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este formulario ha sido usado para envíos de admisión y no se puede eliminar. Puedes desactivarlo en su lugar.`)
};

const en_xa2_intake_forms_delete_has_responses = /** @type {(inputs: Intake_Forms_Delete_Has_ResponsesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs fòrm hàs bèèn ùsèd fòr ìntàkè sùbmìssìòns ànd cànnòt bè dèlètèd. Yòù càn dèàctìvàtè ìt ìnstèàd. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This form has been used for intake submissions and cannot be deleted. You can deactivate it instead." |
*
* @param {Intake_Forms_Delete_Has_ResponsesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_delete_has_responses = /** @type {((inputs?: Intake_Forms_Delete_Has_ResponsesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Delete_Has_ResponsesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_delete_has_responses(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_delete_has_responses(inputs)
	return en_intake_forms_delete_has_responses(inputs)
});