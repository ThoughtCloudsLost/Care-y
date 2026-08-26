/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Continuation_Expanded_TextInputs */

const en_intake_continuation_expanded_text = /** @type {(inputs: Intake_Continuation_Expanded_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`After you submit, you will receive a link. Open it any time to read replies or add more information. Anyone who has the link can read and add to this conversation.`)
};

const es_intake_continuation_expanded_text = /** @type {(inputs: Intake_Continuation_Expanded_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Después de enviar, recibirás un enlace. Ábrelo en cualquier momento para leer respuestas o agregar más información. Cualquier persona que tenga el enlace puede leer y agregar a esta conversación.`)
};

/**
* | output |
* | --- |
* | "After you submit, you will receive a link. Open it any time to read replies or add more information. Anyone who has the link can read and add to this convers..." |
*
* @param {Intake_Continuation_Expanded_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_expanded_text = /** @type {((inputs?: Intake_Continuation_Expanded_TextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_Expanded_TextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_continuation_expanded_text(inputs)
	return es_intake_continuation_expanded_text(inputs)
});