/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_Adjustment_RemoveInputs */

const en_admin_funds_adjustment_remove = /** @type {(inputs: Admin_Funds_Adjustment_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Take money out`)
};

const es_admin_funds_adjustment_remove = /** @type {(inputs: Admin_Funds_Adjustment_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retirar dinero`)
};

const en_xa2_admin_funds_adjustment_remove = /** @type {(inputs: Admin_Funds_Adjustment_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàkè mònèy òùt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Take money out" |
*
* @param {Admin_Funds_Adjustment_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_adjustment_remove = /** @type {((inputs?: Admin_Funds_Adjustment_RemoveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_Adjustment_RemoveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_adjustment_remove(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_adjustment_remove(inputs)
	return en_admin_funds_adjustment_remove(inputs)
});