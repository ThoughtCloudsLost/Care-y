/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, queue: NonNullable<unknown>, Volunteers: NonNullable<unknown>, volunteers: NonNullable<unknown> }} Admin_Queue_Fund_HintInputs */

const en_admin_queue_fund_hint = /** @type {(inputs: Admin_Queue_Fund_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`New disbursements on ${i?.tickets} in this ${i?.queue} start with this fund selected. ${i?.Volunteers} can still choose another.`)
};

const es_admin_queue_fund_hint = /** @type {(inputs: Admin_Queue_Fund_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los desembolsos nuevos en ${i?.tickets} de esta ${i?.queue} empiezan con este fondo seleccionado. Los ${i?.volunteers} pueden elegir otro.`)
};

const en_xa2_admin_queue_fund_hint = /** @type {(inputs: Admin_Queue_Fund_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nèw dìsbùrsèmènts òn  •••••••${i?.tickets} ìn thìs  •••${i?.queue} stàrt wìth thìs fùnd sèlèctèd.  ••••••••••${i?.Volunteers} càn stìll chòòsè ànòthèr. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "New disbursements on {tickets} in this {queue} start with this fund selected. {Volunteers} can still choose another." |
*
* @param {Admin_Queue_Fund_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_fund_hint = /** @type {((inputs: Admin_Queue_Fund_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Fund_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_fund_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_fund_hint(inputs)
	return en_admin_queue_fund_hint(inputs)
});