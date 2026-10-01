/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Fund_LabelInputs */

const en_admin_queue_fund_label = /** @type {(inputs: Admin_Queue_Fund_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fund`)
};

const es_admin_queue_fund_label = /** @type {(inputs: Admin_Queue_Fund_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fondo`)
};

const en_xa2_admin_queue_fund_label = /** @type {(inputs: Admin_Queue_Fund_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnd ••⟧`)
};

/**
* | output |
* | --- |
* | "Fund" |
*
* @param {Admin_Queue_Fund_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_fund_label = /** @type {((inputs?: Admin_Queue_Fund_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Fund_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_fund_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_fund_label(inputs)
	return en_admin_queue_fund_label(inputs)
});