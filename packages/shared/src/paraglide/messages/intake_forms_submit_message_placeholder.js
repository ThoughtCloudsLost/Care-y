/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Submit_Message_PlaceholderInputs */

const en_intake_forms_submit_message_placeholder = /** @type {(inputs: Intake_Forms_Submit_Message_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shown after a successful submission.`)
};

const es_intake_forms_submit_message_placeholder = /** @type {(inputs: Intake_Forms_Submit_Message_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se muestra despues de un envio exitoso.`)
};

/**
* | output |
* | --- |
* | "Shown after a successful submission." |
*
* @param {Intake_Forms_Submit_Message_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_submit_message_placeholder = /** @type {((inputs?: Intake_Forms_Submit_Message_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Submit_Message_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_submit_message_placeholder(inputs)
	return es_intake_forms_submit_message_placeholder(inputs)
});