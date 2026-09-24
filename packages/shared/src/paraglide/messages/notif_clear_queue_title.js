/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Clear_Queue_TitleInputs */

const en_notif_clear_queue_title = /** @type {(inputs: Notif_Clear_Queue_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear queue overrides?`)
};

const es_notif_clear_queue_title = /** @type {(inputs: Notif_Clear_Queue_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Borrar excepciones de cola?`)
};

const en_xa2_notif_clear_queue_title = /** @type {(inputs: Notif_Clear_Queue_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clèàr qùèùè òvèrrìdès? •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Clear queue overrides?" |
*
* @param {Notif_Clear_Queue_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_clear_queue_title = /** @type {((inputs?: Notif_Clear_Queue_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Clear_Queue_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_clear_queue_title(inputs)
	if (locale === "en-XA") return en_xa2_notif_clear_queue_title(inputs)
	return en_notif_clear_queue_title(inputs)
});