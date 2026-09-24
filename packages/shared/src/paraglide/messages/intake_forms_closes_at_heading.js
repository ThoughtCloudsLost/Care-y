/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Closes_At_HeadingInputs */

const en_intake_forms_closes_at_heading = /** @type {(inputs: Intake_Forms_Closes_At_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closing date`)
};

const es_intake_forms_closes_at_heading = /** @type {(inputs: Intake_Forms_Closes_At_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fecha de cierre`)
};

const en_xa2_intake_forms_closes_at_heading = /** @type {(inputs: Intake_Forms_Closes_At_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsìng dàtè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Closing date" |
*
* @param {Intake_Forms_Closes_At_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closes_at_heading = /** @type {((inputs?: Intake_Forms_Closes_At_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Closes_At_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_closes_at_heading(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_closes_at_heading(inputs)
	return en_intake_forms_closes_at_heading(inputs)
});