/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ start: NonNullable<unknown>, end: NonNullable<unknown> }} Dashboard_Shift_EndedInputs */

const en_dashboard_shift_ended = /** @type {(inputs: Dashboard_Shift_EndedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Shift ended (${i?.start} - ${i?.end})`)
};

const es_dashboard_shift_ended = /** @type {(inputs: Dashboard_Shift_EndedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Turno terminado (${i?.start} - ${i?.end})`)
};

const en_xa2_dashboard_shift_ended = /** @type {(inputs: Dashboard_Shift_EndedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Shìft èndèd ( ••••${i?.start} -  •${i?.end}) •⟧`)
};

/**
* | output |
* | --- |
* | "Shift ended ({start} - {end})" |
*
* @param {Dashboard_Shift_EndedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_ended = /** @type {((inputs: Dashboard_Shift_EndedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_EndedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_shift_ended(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_shift_ended(inputs)
	return en_dashboard_shift_ended(inputs)
});