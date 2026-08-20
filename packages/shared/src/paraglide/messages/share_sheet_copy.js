/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Sheet_CopyInputs */

const en_share_sheet_copy = /** @type {(inputs: Share_Sheet_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copy link`)
};

const es_share_sheet_copy = /** @type {(inputs: Share_Sheet_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copiar enlace`)
};

/**
* | output |
* | --- |
* | "Copy link" |
*
* @param {Share_Sheet_CopyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_sheet_copy = /** @type {((inputs?: Share_Sheet_CopyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_CopyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_sheet_copy(inputs)
	return es_share_sheet_copy(inputs)
});