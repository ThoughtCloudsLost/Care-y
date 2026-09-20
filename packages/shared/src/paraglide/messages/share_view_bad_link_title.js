/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_Bad_Link_TitleInputs */

const en_share_view_bad_link_title = /** @type {(inputs: Share_View_Bad_Link_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Incomplete link`)
};

const es_share_view_bad_link_title = /** @type {(inputs: Share_View_Bad_Link_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace incompleto`)
};

const en_xa2_share_view_bad_link_title = /** @type {(inputs: Share_View_Bad_Link_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìncòmplètè lìnk •••••⟧`)
};

/**
* | output |
* | --- |
* | "Incomplete link" |
*
* @param {Share_View_Bad_Link_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_bad_link_title = /** @type {((inputs?: Share_View_Bad_Link_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_Bad_Link_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_view_bad_link_title(inputs)
	if (locale === "en-XA") return en_xa2_share_view_bad_link_title(inputs)
	return en_share_view_bad_link_title(inputs)
});