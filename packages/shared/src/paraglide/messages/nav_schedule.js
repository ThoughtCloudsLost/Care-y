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

const en_xa2_nav_schedule = /** @type {(inputs: Nav_ScheduleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Schèdùlè •••⟧`)
};

/**
* | output |
* | --- |
* | "Schedule" |
*
* @param {Nav_ScheduleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_schedule = /** @type {((inputs?: Nav_ScheduleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_ScheduleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_nav_schedule(inputs)
	if (locale === "en-XA") return en_xa2_nav_schedule(inputs)
	return en_nav_schedule(inputs)
});