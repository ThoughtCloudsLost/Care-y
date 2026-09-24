/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Sheet_Note_SmsInputs */

const en_share_sheet_note_sms = /** @type {(inputs: Share_Sheet_Note_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link can be opened once and expires in 72 hours. The text is kept in the case record. The client gets it by text message.`)
};

const es_share_sheet_note_sms = /** @type {(inputs: Share_Sheet_Note_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace se puede abrir una sola vez y expira en 72 horas. El texto se guarda en el expediente del caso. El cliente lo recibe por mensaje de texto.`)
};

const en_xa2_share_sheet_note_sms = /** @type {(inputs: Share_Sheet_Note_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs lìnk càn bè òpènèd òncè ànd èxpìrès ìn 72 hòùrs. Thè tèxt ìs kèpt ìn thè càsè rècòrd. Thè clìènt gèts ìt by tèxt mèssàgè. ••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This link can be opened once and expires in 72 hours. The text is kept in the case record. The client gets it by text message." |
*
* @param {Share_Sheet_Note_SmsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_sheet_note_sms = /** @type {((inputs?: Share_Sheet_Note_SmsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_Note_SmsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_sheet_note_sms(inputs)
	if (locale === "en-XA") return en_xa2_share_sheet_note_sms(inputs)
	return en_share_sheet_note_sms(inputs)
});