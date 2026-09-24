/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_Opened_TitleInputs */

const en_share_view_opened_title = /** @type {(inputs: Share_View_Opened_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Already opened`)
};

const es_share_view_opened_title = /** @type {(inputs: Share_View_Opened_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ya fue abierto`)
};

const en_xa2_share_view_opened_title = /** @type {(inputs: Share_View_Opened_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àlrèàdy òpènèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Already opened" |
*
* @param {Share_View_Opened_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_opened_title = /** @type {((inputs?: Share_View_Opened_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_Opened_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_view_opened_title(inputs)
	if (locale === "en-XA") return en_xa2_share_view_opened_title(inputs)
	return en_share_view_opened_title(inputs)
});