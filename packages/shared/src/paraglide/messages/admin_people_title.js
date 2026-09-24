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

const en_xa2_admin_people_title = /** @type {(inputs: Admin_People_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pèòplè ••⟧`)
};

/**
* | output |
* | --- |
* | "People" |
*
* @param {Admin_People_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_people_title = /** @type {((inputs?: Admin_People_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_People_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_people_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_people_title(inputs)
	return en_admin_people_title(inputs)
});