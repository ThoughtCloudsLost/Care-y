/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Reset_ConfirmInputs */

const en_roles_reset_confirm = /** @type {(inputs: Roles_Reset_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All permission changes will revert to the defaults. This cannot be undone.`)
};

const es_roles_reset_confirm = /** @type {(inputs: Roles_Reset_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todos los cambios de permisos volverán a los valores predeterminados. Esto no se puede deshacer.`)
};

/**
* | output |
* | --- |
* | "All permission changes will revert to the defaults. This cannot be undone." |
*
* @param {Roles_Reset_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_reset_confirm = /** @type {((inputs?: Roles_Reset_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Reset_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_reset_confirm(inputs)
	return es_roles_reset_confirm(inputs)
});