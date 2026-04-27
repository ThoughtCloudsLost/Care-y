/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Access_ShiftsInputs */

const en_vol_access_shifts = /** @type {(inputs: Vol_Access_ShiftsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage your shifts`)
};

const es_vol_access_shifts = /** @type {(inputs: Vol_Access_ShiftsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar tus turnos`)
};

/**
* | output |
* | --- |
* | "Manage your shifts" |
*
* @param {Vol_Access_ShiftsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_access_shifts = /** @type {((inputs?: Vol_Access_ShiftsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Access_ShiftsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_access_shifts(inputs)
	return es_vol_access_shifts(inputs)
});