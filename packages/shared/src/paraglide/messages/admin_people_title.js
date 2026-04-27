/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_People_TitleInputs */

const en_admin_people_title = /** @type {(inputs: Admin_People_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`People`)
};

const es_admin_people_title = /** @type {(inputs: Admin_People_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personas`)
};

/**
* | output |
* | --- |
* | "People" |
*
* @param {Admin_People_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_people_title = /** @type {((inputs?: Admin_People_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_People_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_people_title(inputs)
	return es_admin_people_title(inputs)
});