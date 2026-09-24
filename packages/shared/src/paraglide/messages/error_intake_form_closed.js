/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Intake_Form_ClosedInputs */

const en_error_intake_form_closed = /** @type {(inputs: Error_Intake_Form_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This form is no longer accepting submissions.`)
};

const es_error_intake_form_closed = /** @type {(inputs: Error_Intake_Form_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este formulario ya no acepta envíos.`)
};

const en_xa2_error_intake_form_closed = /** @type {(inputs: Error_Intake_Form_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs fòrm ìs nò lòngèr àccèptìng sùbmìssìòns. ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This form is no longer accepting submissions." |
*
* @param {Error_Intake_Form_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_intake_form_closed = /** @type {((inputs?: Error_Intake_Form_ClosedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Intake_Form_ClosedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_intake_form_closed(inputs)
	if (locale === "en-XA") return en_xa2_error_intake_form_closed(inputs)
	return en_error_intake_form_closed(inputs)
});