/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Fund_NoneInputs */

const en_admin_queue_fund_none = /** @type {(inputs: Admin_Queue_Fund_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No fund`)
};

const es_admin_queue_fund_none = /** @type {(inputs: Admin_Queue_Fund_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin fondo`)
};

const en_xa2_admin_queue_fund_none = /** @type {(inputs: Admin_Queue_Fund_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò fùnd •••⟧`)
};

/**
* | output |
* | --- |
* | "No fund" |
*
* @param {Admin_Queue_Fund_NoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_fund_none = /** @type {((inputs?: Admin_Queue_Fund_NoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Fund_NoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_fund_none(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_fund_none(inputs)
	return en_admin_queue_fund_none(inputs)
});