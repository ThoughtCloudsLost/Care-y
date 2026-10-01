/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Fund_TitleInputs */

const en_admin_queue_fund_title = /** @type {(inputs: Admin_Queue_Fund_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assistance fund`)
};

const es_admin_queue_fund_title = /** @type {(inputs: Admin_Queue_Fund_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fondo de ayuda`)
};

const en_xa2_admin_queue_fund_title = /** @type {(inputs: Admin_Queue_Fund_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àssìstàncè fùnd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Assistance fund" |
*
* @param {Admin_Queue_Fund_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_fund_title = /** @type {((inputs?: Admin_Queue_Fund_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Fund_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_fund_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_fund_title(inputs)
	return en_admin_queue_fund_title(inputs)
});