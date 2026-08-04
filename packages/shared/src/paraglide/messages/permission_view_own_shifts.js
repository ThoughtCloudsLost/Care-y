/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Own_ShiftsInputs */

const en_permission_view_own_shifts = /** @type {(inputs: Permission_View_Own_ShiftsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View own shifts`)
};

const es_permission_view_own_shifts = /** @type {(inputs: Permission_View_Own_ShiftsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver turnos propios`)
};

/**
* | output |
* | --- |
* | "View own shifts" |
*
* @param {Permission_View_Own_ShiftsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_own_shifts = /** @type {((inputs?: Permission_View_Own_ShiftsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Own_ShiftsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_view_own_shifts(inputs)
	return es_permission_view_own_shifts(inputs)
});