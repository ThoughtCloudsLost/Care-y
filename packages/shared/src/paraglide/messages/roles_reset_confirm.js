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

const en_xa2_roles_reset_confirm = /** @type {(inputs: Roles_Reset_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àll pèrmìssìòn chàngès wìll rèvèrt tò thè dèfàùlts. Thìs cànnòt bè ùndònè. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "All permission changes will revert to the defaults. This cannot be undone." |
*
* @param {Roles_Reset_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_reset_confirm = /** @type {((inputs?: Roles_Reset_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Reset_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_reset_confirm(inputs)
	if (locale === "en-XA") return en_xa2_roles_reset_confirm(inputs)
	return en_roles_reset_confirm(inputs)
});