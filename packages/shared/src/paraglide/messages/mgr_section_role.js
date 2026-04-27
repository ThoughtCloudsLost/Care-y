/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Section_RoleInputs */

const en_mgr_section_role = /** @type {(inputs: Mgr_Section_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your Role`)
};

const es_mgr_section_role = /** @type {(inputs: Mgr_Section_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu Rol`)
};

/**
* | output |
* | --- |
* | "Your Role" |
*
* @param {Mgr_Section_RoleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_section_role = /** @type {((inputs?: Mgr_Section_RoleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Section_RoleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_section_role(inputs)
	return es_mgr_section_role(inputs)
});