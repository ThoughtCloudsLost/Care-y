/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_Record_AdjustmentInputs */

const en_admin_funds_record_adjustment = /** @type {(inputs: Admin_Funds_Record_AdjustmentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Record adjustment`)
};

const es_admin_funds_record_adjustment = /** @type {(inputs: Admin_Funds_Record_AdjustmentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registrar ajuste`)
};

const en_xa2_admin_funds_record_adjustment = /** @type {(inputs: Admin_Funds_Record_AdjustmentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòrd àdjùstmènt ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Record adjustment" |
*
* @param {Admin_Funds_Record_AdjustmentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_record_adjustment = /** @type {((inputs?: Admin_Funds_Record_AdjustmentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_Record_AdjustmentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_record_adjustment(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_record_adjustment(inputs)
	return en_admin_funds_record_adjustment(inputs)
});