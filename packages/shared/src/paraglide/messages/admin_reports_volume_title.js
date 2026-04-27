/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reports_Volume_TitleInputs */

const en_admin_reports_volume_title = /** @type {(inputs: Admin_Reports_Volume_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volume trends`)
};

const es_admin_reports_volume_title = /** @type {(inputs: Admin_Reports_Volume_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tendencias de volumen`)
};

/**
* | output |
* | --- |
* | "Volume trends" |
*
* @param {Admin_Reports_Volume_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_volume_title = /** @type {((inputs?: Admin_Reports_Volume_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Volume_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_volume_title(inputs)
	return es_admin_reports_volume_title(inputs)
});