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

const en_xa2_intake_avail_add_recurring = /** @type {(inputs: Intake_Avail_Add_RecurringInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd wèèkly tìmè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Add weekly time" |
*
* @param {Intake_Avail_Add_RecurringInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_add_recurring = /** @type {((inputs?: Intake_Avail_Add_RecurringInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Add_RecurringInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_add_recurring(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_add_recurring(inputs)
	return en_intake_avail_add_recurring(inputs)
});