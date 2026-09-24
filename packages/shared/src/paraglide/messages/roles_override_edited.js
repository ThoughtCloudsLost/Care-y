/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Override_EditedInputs */

const en_roles_override_edited = /** @type {(inputs: Roles_Override_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`edited`)
};

const es_roles_override_edited = /** @type {(inputs: Roles_Override_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`editado`)
};

const en_xa2_roles_override_edited = /** @type {(inputs: Roles_Override_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦èdìtèd ••⟧`)
};

/**
* | output |
* | --- |
* | "edited" |
*
* @param {Roles_Override_EditedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_override_edited = /** @type {((inputs?: Roles_Override_EditedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Override_EditedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_override_edited(inputs)
	if (locale === "en-XA") return en_xa2_roles_override_edited(inputs)
	return en_roles_override_edited(inputs)
});