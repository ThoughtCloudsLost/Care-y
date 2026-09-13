/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Unit_HoursInputs */

const en_escalation_unit_hours = /** @type {(inputs: Escalation_Unit_HoursInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hours`)
};

const es_escalation_unit_hours = /** @type {(inputs: Escalation_Unit_HoursInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Horas`)
};

/**
* | output |
* | --- |
* | "Hours" |
*
* @param {Escalation_Unit_HoursInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_unit_hours = /** @type {((inputs?: Escalation_Unit_HoursInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Unit_HoursInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_unit_hours(inputs)
	return es_escalation_unit_hours(inputs)
});