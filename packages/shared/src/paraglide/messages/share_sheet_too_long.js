/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Sheet_Too_LongInputs */

const en_share_sheet_too_long = /** @type {(inputs: Share_Sheet_Too_LongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This message is too long to send as a secure link.`)
};

const es_share_sheet_too_long = /** @type {(inputs: Share_Sheet_Too_LongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este mensaje es demasiado largo para enviarlo como enlace seguro.`)
};

/**
* | output |
* | --- |
* | "This message is too long to send as a secure link." |
*
* @param {Share_Sheet_Too_LongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_sheet_too_long = /** @type {((inputs?: Share_Sheet_Too_LongInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_Too_LongInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_sheet_too_long(inputs)
	return es_share_sheet_too_long(inputs)
});