/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Form_Closed_DefaultInputs */

const en_intake_form_closed_default = /** @type {(inputs: Intake_Form_Closed_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This form is no longer accepting submissions.`)
};

const es_intake_form_closed_default = /** @type {(inputs: Intake_Form_Closed_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este formulario ya no acepta envíos.`)
};

/**
* | output |
* | --- |
* | "This form is no longer accepting submissions." |
*
* @param {Intake_Form_Closed_DefaultInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_form_closed_default = /** @type {((inputs?: Intake_Form_Closed_DefaultInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Form_Closed_DefaultInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_form_closed_default(inputs)
	return es_intake_form_closed_default(inputs)
});