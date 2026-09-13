/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Reset_DefaultsInputs */

const en_roles_reset_defaults = /** @type {(inputs: Roles_Reset_DefaultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset to defaults`)
};

const es_roles_reset_defaults = /** @type {(inputs: Roles_Reset_DefaultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restablecer valores predeterminados`)
};

/**
* | output |
* | --- |
* | "Reset to defaults" |
*
* @param {Roles_Reset_DefaultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_reset_defaults = /** @type {((inputs?: Roles_Reset_DefaultsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Reset_DefaultsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_reset_defaults(inputs)
	return es_roles_reset_defaults(inputs)
});