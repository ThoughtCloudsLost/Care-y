/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Notif_Clear_Queue_ConfirmInputs */

const en_notif_clear_queue_confirm = /** @type {(inputs: Notif_Clear_Queue_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Overrides for ${i?.queue} will be removed. Your global preferences will apply instead.`)
};

const es_notif_clear_queue_confirm = /** @type {(inputs: Notif_Clear_Queue_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Las excepciones para ${i?.queue} seran eliminadas. Tus preferencias globales se aplicaran en su lugar.`)
};

/**
* | output |
* | --- |
* | "Overrides for {queue} will be removed. Your global preferences will apply instead." |
*
* @param {Notif_Clear_Queue_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_clear_queue_confirm = /** @type {((inputs: Notif_Clear_Queue_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Clear_Queue_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_clear_queue_confirm(inputs)
	return es_notif_clear_queue_confirm(inputs)
});