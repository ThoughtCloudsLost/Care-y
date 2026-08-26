/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Default_Form_NoteInputs */

const en_intake_responses_default_form_note = /** @type {(inputs: Intake_Responses_Default_Form_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Default form submissions do not produce response rows. This viewer covers custom forms only.`)
};

const es_intake_responses_default_form_note = /** @type {(inputs: Intake_Responses_Default_Form_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las respuestas del formulario predeterminado no generan filas de respuesta. Este visor cubre solo formularios personalizados.`)
};

/**
* | output |
* | --- |
* | "Default form submissions do not produce response rows. This viewer covers custom forms only." |
*
* @param {Intake_Responses_Default_Form_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_default_form_note = /** @type {((inputs?: Intake_Responses_Default_Form_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Default_Form_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_default_form_note(inputs)
	return es_intake_responses_default_form_note(inputs)
});