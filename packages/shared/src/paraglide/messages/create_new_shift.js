/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Create_New_ShiftInputs */

const en_create_new_shift = /** @type {(inputs: Create_New_ShiftInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New Shift`)
};

const es_create_new_shift = /** @type {(inputs: Create_New_ShiftInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo Turno`)
};

/**
* | output |
* | --- |
* | "New Shift" |
*
* @param {Create_New_ShiftInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_new_shift = /** @type {((inputs?: Create_New_ShiftInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Create_New_ShiftInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_create_new_shift(inputs)
	return es_create_new_shift(inputs)
});