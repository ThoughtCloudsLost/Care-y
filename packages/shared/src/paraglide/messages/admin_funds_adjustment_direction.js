/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_Adjustment_DirectionInputs */

const en_admin_funds_adjustment_direction = /** @type {(inputs: Admin_Funds_Adjustment_DirectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Direction`)
};

const es_admin_funds_adjustment_direction = /** @type {(inputs: Admin_Funds_Adjustment_DirectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo de ajuste`)
};

const en_xa2_admin_funds_adjustment_direction = /** @type {(inputs: Admin_Funds_Adjustment_DirectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìrèctìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Direction" |
*
* @param {Admin_Funds_Adjustment_DirectionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_adjustment_direction = /** @type {((inputs?: Admin_Funds_Adjustment_DirectionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_Adjustment_DirectionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_adjustment_direction(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_adjustment_direction(inputs)
	return en_admin_funds_adjustment_direction(inputs)
});