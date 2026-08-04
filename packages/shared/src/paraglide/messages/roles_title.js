/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_TitleInputs */

const en_roles_title = /** @type {(inputs: Roles_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Roles`)
};

const es_roles_title = /** @type {(inputs: Roles_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Roles`)
};

/**
* | output |
* | --- |
* | "Roles" |
*
* @param {Roles_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_title = /** @type {((inputs?: Roles_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_title(inputs)
	return es_roles_title(inputs)
});