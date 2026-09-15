/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Own_ShiftsInputs */

const en_permission_view_own_shifts = /** @type {(inputs: Permission_View_Own_ShiftsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`See your own shifts`)
};

const es_permission_view_own_shifts = /** @type {(inputs: Permission_View_Own_ShiftsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver tus propios turnos`)
};

/**
* | output |
* | --- |
* | "See your own shifts" |
*
* @param {Permission_View_Own_ShiftsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_own_shifts = /** @type {((inputs?: Permission_View_Own_ShiftsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Own_ShiftsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_own_shifts(inputs)
	return en_permission_view_own_shifts(inputs)
});