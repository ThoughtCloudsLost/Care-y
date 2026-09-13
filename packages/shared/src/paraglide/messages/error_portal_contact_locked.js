/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Portal_Contact_LockedInputs */

const en_error_portal_contact_locked = /** @type {(inputs: Error_Portal_Contact_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add a password or create an account to see the contact info on file.`)
};

const es_error_portal_contact_locked = /** @type {(inputs: Error_Portal_Contact_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agrega una contraseña o crea una cuenta para ver la información de contacto registrada.`)
};

/**
* | output |
* | --- |
* | "Add a password or create an account to see the contact info on file." |
*
* @param {Error_Portal_Contact_LockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_contact_locked = /** @type {((inputs?: Error_Portal_Contact_LockedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Contact_LockedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_portal_contact_locked(inputs)
	return es_error_portal_contact_locked(inputs)
});