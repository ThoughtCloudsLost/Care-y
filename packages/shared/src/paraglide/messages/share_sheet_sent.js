/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Sheet_SentInputs */

const en_share_sheet_sent = /** @type {(inputs: Share_Sheet_SentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link sent`)
};

const es_share_sheet_sent = /** @type {(inputs: Share_Sheet_SentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace enviado`)
};

/**
* | output |
* | --- |
* | "Link sent" |
*
* @param {Share_Sheet_SentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_sheet_sent = /** @type {((inputs?: Share_Sheet_SentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_SentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_sheet_sent(inputs)
	return es_share_sheet_sent(inputs)
});