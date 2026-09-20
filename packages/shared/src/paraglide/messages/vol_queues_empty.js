/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Queues_EmptyInputs */

const en_vol_queues_empty = /** @type {(inputs: Vol_Queues_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You are not assigned to any queues yet.`)
};

const es_vol_queues_empty = /** @type {(inputs: Vol_Queues_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No tienes colas asignadas todavía.`)
};

const en_xa2_vol_queues_empty = /** @type {(inputs: Vol_Queues_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòù àrè nòt àssìgnèd tò àny qùèùès yèt. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "You are not assigned to any queues yet." |
*
* @param {Vol_Queues_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_queues_empty = /** @type {((inputs?: Vol_Queues_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Queues_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_queues_empty(inputs)
	if (locale === "en-XA") return en_xa2_vol_queues_empty(inputs)
	return en_vol_queues_empty(inputs)
});