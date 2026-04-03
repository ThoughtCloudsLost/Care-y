/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Shift_VolunteersInputs */

const en_dashboard_shift_volunteers = /** @type {(inputs: Dashboard_Shift_VolunteersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} on shift`)
};

const es_dashboard_shift_volunteers = /** @type {(inputs: Dashboard_Shift_VolunteersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} en turno`)
};

/**
* | output |
* | --- |
* | "{count} on shift" |
*
* @param {Dashboard_Shift_VolunteersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_volunteers = /** @type {((inputs: Dashboard_Shift_VolunteersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_VolunteersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_shift_volunteers(inputs)
	return es_dashboard_shift_volunteers(inputs)
});