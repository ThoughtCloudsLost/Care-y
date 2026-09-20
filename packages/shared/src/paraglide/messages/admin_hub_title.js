/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Hub_TitleInputs */

const en_admin_hub_title = /** @type {(inputs: Admin_Hub_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Admin`)
};

const es_admin_hub_title = /** @type {(inputs: Admin_Hub_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administración`)
};

const en_xa2_admin_hub_title = /** @type {(inputs: Admin_Hub_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdmìn ••⟧`)
};

/**
* | output |
* | --- |
* | "Admin" |
*
* @param {Admin_Hub_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_hub_title = /** @type {((inputs?: Admin_Hub_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_hub_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_hub_title(inputs)
	return en_admin_hub_title(inputs)
});