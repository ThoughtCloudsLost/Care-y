/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Closed_Message_HintInputs */

const en_intake_forms_closed_message_hint = /** @type {(inputs: Intake_Forms_Closed_Message_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Displayed when the form's closing date has passed.`)
};

const es_intake_forms_closed_message_hint = /** @type {(inputs: Intake_Forms_Closed_Message_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se muestra cuando la fecha de cierre del formulario ha pasado.`)
};

/**
* | output |
* | --- |
* | "Displayed when the form's closing date has passed." |
*
* @param {Intake_Forms_Closed_Message_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closed_message_hint = /** @type {((inputs?: Intake_Forms_Closed_Message_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Closed_Message_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_closed_message_hint(inputs)
	return es_intake_forms_closed_message_hint(inputs)
});