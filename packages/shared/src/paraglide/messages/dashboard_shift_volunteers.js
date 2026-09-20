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

const en_xa2_dashboard_shift_volunteers = /** @type {(inputs: Dashboard_Shift_VolunteersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} òn shìft •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} on shift" |
*
* @param {Dashboard_Shift_VolunteersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_volunteers = /** @type {((inputs: Dashboard_Shift_VolunteersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_VolunteersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_shift_volunteers(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_shift_volunteers(inputs)
	return en_dashboard_shift_volunteers(inputs)
});