/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Hub_TitleInputs */

const en_admin_hub_title = /** @type {(inputs: Admin_Hub_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Admin`)
};

const es_admin_hub_title = /** @type {(inputs: Admin_Hub_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administracion`)
};

/**
* | output |
* | --- |
* | "Admin" |
*
* @param {Admin_Hub_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_title = /** @type {((inputs?: Admin_Hub_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_hub_title(inputs)
	return es_admin_hub_title(inputs)
});