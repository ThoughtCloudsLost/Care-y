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

/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Share_Sheet_SendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_sheet_sending = /** @type {((inputs?: Share_Sheet_SendingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_SendingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_sheet_sending(inputs)
	return es_share_sheet_sending(inputs)
});