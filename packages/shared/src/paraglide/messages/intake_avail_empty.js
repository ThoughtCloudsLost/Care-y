/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_EmptyInputs */

const en_intake_avail_empty = /** @type {(inputs: Intake_Avail_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No times added yet.`)
};

const es_intake_avail_empty = /** @type {(inputs: Intake_Avail_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se han agregado horarios.`)
};

/**
* | output |
* | --- |
* | "No times added yet." |
*
* @param {Intake_Avail_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_empty = /** @type {((inputs?: Intake_Avail_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_empty(inputs)
	return es_intake_avail_empty(inputs)
});