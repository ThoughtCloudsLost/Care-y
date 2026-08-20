/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_One_Time_NoticeInputs */

const en_share_view_one_time_notice = /** @type {(inputs: Share_View_One_Time_NoticeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link has now been used and cannot be opened again. Save what you need before closing this page.`)
};

const es_share_view_one_time_notice = /** @type {(inputs: Share_View_One_Time_NoticeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace ya se usó y no se puede abrir de nuevo. Guarda lo que necesites antes de cerrar esta página.`)
};

/**
* | output |
* | --- |
* | "This link has now been used and cannot be opened again. Save what you need before closing this page." |
*
* @param {Share_View_One_Time_NoticeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_one_time_notice = /** @type {((inputs?: Share_View_One_Time_NoticeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_One_Time_NoticeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_view_one_time_notice(inputs)
	return es_share_view_one_time_notice(inputs)
});