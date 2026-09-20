/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Sheet_CopiedInputs */

const en_share_sheet_copied = /** @type {(inputs: Share_Sheet_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link copied`)
};

const es_share_sheet_copied = /** @type {(inputs: Share_Sheet_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace copiado`)
};

const en_xa2_share_sheet_copied = /** @type {(inputs: Share_Sheet_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìnk còpìèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Link copied" |
*
* @param {Share_Sheet_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_sheet_copied = /** @type {((inputs?: Share_Sheet_CopiedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_CopiedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_sheet_copied(inputs)
	if (locale === "en-XA") return en_xa2_share_sheet_copied(inputs)
	return en_share_sheet_copied(inputs)
});