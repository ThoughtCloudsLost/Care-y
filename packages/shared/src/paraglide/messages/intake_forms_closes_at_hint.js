/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Closes_At_HintInputs */

const en_intake_forms_closes_at_hint = /** @type {(inputs: Intake_Forms_Closes_At_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`After this date and time, the form will stop accepting submissions.`)
};

const es_intake_forms_closes_at_hint = /** @type {(inputs: Intake_Forms_Closes_At_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tras esta fecha y hora, el formulario dejará de aceptar envíos.`)
};

/**
* | output |
* | --- |
* | "After this date and time, the form will stop accepting submissions." |
*
* @param {Intake_Forms_Closes_At_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closes_at_hint = /** @type {((inputs?: Intake_Forms_Closes_At_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Closes_At_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_closes_at_hint(inputs)
	return es_intake_forms_closes_at_hint(inputs)
});