/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Clear_Queue_TitleInputs */

const en_notif_clear_queue_title = /** @type {(inputs: Notif_Clear_Queue_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear queue overrides?`)
};

const es_notif_clear_queue_title = /** @type {(inputs: Notif_Clear_Queue_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Borrar excepciones de cola?`)
};

/**
* | output |
* | --- |
* | "Clear queue overrides?" |
*
* @param {Notif_Clear_Queue_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_clear_queue_title = /** @type {((inputs?: Notif_Clear_Queue_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Clear_Queue_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_clear_queue_title(inputs)
	return es_notif_clear_queue_title(inputs)
});