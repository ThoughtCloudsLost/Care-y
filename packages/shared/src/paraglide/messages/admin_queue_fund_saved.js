/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queue: NonNullable<unknown> }} Admin_Queue_Fund_SavedInputs */

const en_admin_queue_fund_saved = /** @type {(inputs: Admin_Queue_Fund_SavedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} fund updated`)
};

const es_admin_queue_fund_saved = /** @type {(inputs: Admin_Queue_Fund_SavedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Fondo de la ${i?.queue} actualizado`)
};

const en_xa2_admin_queue_fund_saved = /** @type {(inputs: Admin_Queue_Fund_SavedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} fùnd ùpdàtèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} fund updated" |
*
* @param {Admin_Queue_Fund_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_fund_saved = /** @type {((inputs: Admin_Queue_Fund_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Fund_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_fund_saved(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_fund_saved(inputs)
	return en_admin_queue_fund_saved(inputs)
});