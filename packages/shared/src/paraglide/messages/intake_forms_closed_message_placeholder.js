/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Closed_Message_PlaceholderInputs */

const en_intake_forms_closed_message_placeholder = /** @type {(inputs: Intake_Forms_Closed_Message_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shown when the form has closed.`)
};

const es_intake_forms_closed_message_placeholder = /** @type {(inputs: Intake_Forms_Closed_Message_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se muestra cuando el formulario ha cerrado.`)
};

/**
* | output |
* | --- |
* | "Shown when the form has closed." |
*
* @param {Intake_Forms_Closed_Message_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closed_message_placeholder = /** @type {((inputs?: Intake_Forms_Closed_Message_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Closed_Message_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_closed_message_placeholder(inputs)
	return es_intake_forms_closed_message_placeholder(inputs)
});