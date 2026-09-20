/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Default_LockedInputs */

const en_admin_note_types_default_locked = /** @type {(inputs: Admin_Note_Types_Default_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Default type cannot be deactivated`)
};

const es_admin_note_types_default_locked = /** @type {(inputs: Admin_Note_Types_Default_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El tipo predeterminado no puede desactivarse`)
};

const en_xa2_admin_note_types_default_locked = /** @type {(inputs: Admin_Note_Types_Default_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèfàùlt typè cànnòt bè dèàctìvàtèd •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Default type cannot be deactivated" |
*
* @param {Admin_Note_Types_Default_LockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_default_locked = /** @type {((inputs?: Admin_Note_Types_Default_LockedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Default_LockedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_default_locked(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_default_locked(inputs)
	return en_admin_note_types_default_locked(inputs)
});