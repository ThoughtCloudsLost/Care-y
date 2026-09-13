/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Closes_At_ClearInputs */

const en_intake_forms_closes_at_clear = /** @type {(inputs: Intake_Forms_Closes_At_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear closing date`)
};

const es_intake_forms_closes_at_clear = /** @type {(inputs: Intake_Forms_Closes_At_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Borrar fecha de cierre`)
};

/**
* | output |
* | --- |
* | "Clear closing date" |
*
* @param {Intake_Forms_Closes_At_ClearInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closes_at_clear = /** @type {((inputs?: Intake_Forms_Closes_At_ClearInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Closes_At_ClearInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_closes_at_clear(inputs)
	return es_intake_forms_closes_at_clear(inputs)
});