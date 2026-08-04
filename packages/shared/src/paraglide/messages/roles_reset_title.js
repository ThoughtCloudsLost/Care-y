/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Reset_TitleInputs */

const en_roles_reset_title = /** @type {(inputs: Roles_Reset_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset role permissions?`)
};

const es_roles_reset_title = /** @type {(inputs: Roles_Reset_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Restablecer permisos de roles?`)
};

/**
* | output |
* | --- |
* | "Reset role permissions?" |
*
* @param {Roles_Reset_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_reset_title = /** @type {((inputs?: Roles_Reset_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Reset_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_reset_title(inputs)
	return es_roles_reset_title(inputs)
});