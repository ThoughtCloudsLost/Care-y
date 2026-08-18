/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Recurring_TitleInputs */

const en_intake_avail_recurring_title = /** @type {(inputs: Intake_Avail_Recurring_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Weekly times`)
};

const es_intake_avail_recurring_title = /** @type {(inputs: Intake_Avail_Recurring_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Horarios semanales`)
};

/**
* | output |
* | --- |
* | "Weekly times" |
*
* @param {Intake_Avail_Recurring_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_recurring_title = /** @type {((inputs?: Intake_Avail_Recurring_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Recurring_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_recurring_title(inputs)
	return es_intake_avail_recurring_title(inputs)
});