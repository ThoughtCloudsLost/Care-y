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

/**
* | output |
* | --- |
* | "Default type cannot be deactivated" |
*
* @param {Admin_Note_Types_Default_LockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_default_locked = /** @type {((inputs?: Admin_Note_Types_Default_LockedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Default_LockedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_default_locked(inputs)
	return es_admin_note_types_default_locked(inputs)
});