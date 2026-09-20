/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Sheet_SendingInputs */

const en_share_sheet_sending = /** @type {(inputs: Share_Sheet_SendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sending...`)
};

const es_share_sheet_sending = /** @type {(inputs: Share_Sheet_SendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviando...`)
};

const en_xa2_share_sheet_sending = /** @type {(inputs: Share_Sheet_SendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèndìng... •••⟧`)
};

/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Share_Sheet_SendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_sheet_sending = /** @type {((inputs?: Share_Sheet_SendingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_SendingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_sheet_sending(inputs)
	if (locale === "en-XA") return en_xa2_share_sheet_sending(inputs)
	return en_share_sheet_sending(inputs)
});