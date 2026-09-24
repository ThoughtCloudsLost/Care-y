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

const en_xa2_error_portal_contact_locked = /** @type {(inputs: Error_Portal_Contact_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd à pàsswòrd òr crèàtè àn àccòùnt tò sèè thè còntàct ìnfò òn fìlè. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Add a password or create an account to see the contact info on file." |
*
* @param {Error_Portal_Contact_LockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_portal_contact_locked = /** @type {((inputs?: Error_Portal_Contact_LockedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Contact_LockedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_portal_contact_locked(inputs)
	if (locale === "en-XA") return en_xa2_error_portal_contact_locked(inputs)
	return en_error_portal_contact_locked(inputs)
});