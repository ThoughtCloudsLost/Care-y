/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Sheet_TitleInputs */

const en_share_sheet_title = /** @type {(inputs: Share_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send secure link`)
};

const es_share_sheet_title = /** @type {(inputs: Share_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar enlace seguro`)
};

const en_xa2_share_sheet_title = /** @type {(inputs: Share_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd sècùrè lìnk •••••⟧`)
};

/**
* | output |
* | --- |
* | "Send secure link" |
*
* @param {Share_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_sheet_title = /** @type {((inputs?: Share_Sheet_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_sheet_title(inputs)
	if (locale === "en-XA") return en_xa2_share_sheet_title(inputs)
	return en_share_sheet_title(inputs)
});