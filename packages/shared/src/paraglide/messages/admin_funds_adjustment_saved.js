/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_Adjustment_SavedInputs */

const en_admin_funds_adjustment_saved = /** @type {(inputs: Admin_Funds_Adjustment_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Adjustment recorded`)
};

const es_admin_funds_adjustment_saved = /** @type {(inputs: Admin_Funds_Adjustment_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ajuste registrado`)
};

const en_xa2_admin_funds_adjustment_saved = /** @type {(inputs: Admin_Funds_Adjustment_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdjùstmènt rècòrdèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Adjustment recorded" |
*
* @param {Admin_Funds_Adjustment_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_adjustment_saved = /** @type {((inputs?: Admin_Funds_Adjustment_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_Adjustment_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_adjustment_saved(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_adjustment_saved(inputs)
	return en_admin_funds_adjustment_saved(inputs)
});