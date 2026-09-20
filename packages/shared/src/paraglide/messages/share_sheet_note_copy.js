/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Sheet_Note_CopyInputs */

const en_share_sheet_note_copy = /** @type {(inputs: Share_Sheet_Note_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link can be opened once and expires in 72 hours. The text is kept in the case record. Copy the link and deliver it yourself.`)
};

const es_share_sheet_note_copy = /** @type {(inputs: Share_Sheet_Note_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace se puede abrir una sola vez y expira en 72 horas. El texto se guarda en el expediente del caso. Copia el enlace y entrégalo directamente.`)
};

const en_xa2_share_sheet_note_copy = /** @type {(inputs: Share_Sheet_Note_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs lìnk càn bè òpènèd òncè ànd èxpìrès ìn 72 hòùrs. Thè tèxt ìs kèpt ìn thè càsè rècòrd. Còpy thè lìnk ànd dèlìvèr ìt yòùrsèlf. •••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This link can be opened once and expires in 72 hours. The text is kept in the case record. Copy the link and deliver it yourself." |
*
* @param {Share_Sheet_Note_CopyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_sheet_note_copy = /** @type {((inputs?: Share_Sheet_Note_CopyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_Note_CopyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_sheet_note_copy(inputs)
	if (locale === "en-XA") return en_xa2_share_sheet_note_copy(inputs)
	return en_share_sheet_note_copy(inputs)
});