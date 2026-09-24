/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Notif_Clear_Queue_ConfirmInputs */

const en_notif_clear_queue_confirm = /** @type {(inputs: Notif_Clear_Queue_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Overrides for ${i?.queue} will be removed. Your global preferences will apply instead.`)
};

const es_notif_clear_queue_confirm = /** @type {(inputs: Notif_Clear_Queue_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Las excepciones para ${i?.queue} serán eliminadas. Tus preferencias globales se aplicarán en su lugar.`)
};

const en_xa2_notif_clear_queue_confirm = /** @type {(inputs: Notif_Clear_Queue_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Òvèrrìdès fòr  •••••${i?.queue} wìll bè rèmòvèd. Yòùr glòbàl prèfèrèncès wìll àpply ìnstèàd. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Overrides for {queue} will be removed. Your global preferences will apply instead." |
*
* @param {Notif_Clear_Queue_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_clear_queue_confirm = /** @type {((inputs: Notif_Clear_Queue_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Clear_Queue_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_clear_queue_confirm(inputs)
	if (locale === "en-XA") return en_xa2_notif_clear_queue_confirm(inputs)
	return en_notif_clear_queue_confirm(inputs)
});