/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_Expired_TitleInputs */

const en_share_view_expired_title = /** @type {(inputs: Share_View_Expired_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Expired link`)
};

const es_share_view_expired_title = /** @type {(inputs: Share_View_Expired_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace caducado`)
};

const en_xa2_share_view_expired_title = /** @type {(inputs: Share_View_Expired_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxpìrèd lìnk ••••⟧`)
};

/**
* | output |
* | --- |
* | "Expired link" |
*
* @param {Share_View_Expired_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_expired_title = /** @type {((inputs?: Share_View_Expired_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_Expired_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_view_expired_title(inputs)
	if (locale === "en-XA") return en_xa2_share_view_expired_title(inputs)
	return en_share_view_expired_title(inputs)
});