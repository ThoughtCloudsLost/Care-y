/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Add_RecurringInputs */

const en_intake_avail_add_recurring = /** @type {(inputs: Intake_Avail_Add_RecurringInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add weekly time`)
};

const es_intake_avail_add_recurring = /** @type {(inputs: Intake_Avail_Add_RecurringInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar horario semanal`)
};

/**
* | output |
* | --- |
* | "Add weekly time" |
*
* @param {Intake_Avail_Add_RecurringInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_add_recurring = /** @type {((inputs?: Intake_Avail_Add_RecurringInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Add_RecurringInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_add_recurring(inputs)
	return es_intake_avail_add_recurring(inputs)
});