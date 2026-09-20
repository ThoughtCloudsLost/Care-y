/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Sheet_PlaceholderInputs */

const en_share_sheet_placeholder = /** @type {(inputs: Share_Sheet_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the information to share...`)
};

const es_share_sheet_placeholder = /** @type {(inputs: Share_Sheet_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe la información para compartir...`)
};

const en_xa2_share_sheet_placeholder = /** @type {(inputs: Share_Sheet_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr thè ìnfòrmàtìòn tò shàrè... ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter the information to share..." |
*
* @param {Share_Sheet_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_sheet_placeholder = /** @type {((inputs?: Share_Sheet_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_sheet_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_share_sheet_placeholder(inputs)
	return en_share_sheet_placeholder(inputs)
});