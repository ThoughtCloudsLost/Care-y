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

const en_xa2_vol_access_shifts = /** @type {(inputs: Vol_Access_ShiftsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè yòùr shìfts ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage your shifts" |
*
* @param {Vol_Access_ShiftsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_access_shifts = /** @type {((inputs?: Vol_Access_ShiftsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Access_ShiftsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_access_shifts(inputs)
	if (locale === "en-XA") return en_xa2_vol_access_shifts(inputs)
	return en_vol_access_shifts(inputs)
});