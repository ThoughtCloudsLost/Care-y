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

/**
* | output |
* | --- |
* | "Closing date" |
*
* @param {Intake_Forms_Closes_At_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closes_at_heading = /** @type {((inputs?: Intake_Forms_Closes_At_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Closes_At_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_closes_at_heading(inputs)
	return es_intake_forms_closes_at_heading(inputs)
});