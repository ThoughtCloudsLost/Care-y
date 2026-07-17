/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_ScheduleInputs */

const en_nav_schedule = /** @type {(inputs: Nav_ScheduleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Schedule`)
};

const es_nav_schedule = /** @type {(inputs: Nav_ScheduleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Horario`)
};

/**
* | output |
* | --- |
* | "Schedule" |
*
* @param {Nav_ScheduleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_schedule = /** @type {((inputs?: Nav_ScheduleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_ScheduleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nav_schedule(inputs)
	return es_nav_schedule(inputs)
});