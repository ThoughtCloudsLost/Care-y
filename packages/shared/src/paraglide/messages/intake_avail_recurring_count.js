/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, max: NonNullable<unknown> }} Intake_Avail_Recurring_CountInputs */

const en_intake_avail_recurring_count = /** @type {(inputs: Intake_Avail_Recurring_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} of ${i?.max}`)
};

const es_intake_avail_recurring_count = /** @type {(inputs: Intake_Avail_Recurring_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} de ${i?.max}`)
};

/**
* | output |
* | --- |
* | "{count} of {max}" |
*
* @param {Intake_Avail_Recurring_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_recurring_count = /** @type {((inputs: Intake_Avail_Recurring_CountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Recurring_CountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_recurring_count(inputs)
	return es_intake_avail_recurring_count(inputs)
});