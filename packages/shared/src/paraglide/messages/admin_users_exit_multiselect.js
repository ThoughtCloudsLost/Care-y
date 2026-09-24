/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Exit_MultiselectInputs */

const en_admin_users_exit_multiselect = /** @type {(inputs: Admin_Users_Exit_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancel selection`)
};

const es_admin_users_exit_multiselect = /** @type {(inputs: Admin_Users_Exit_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancelar selección`)
};

const en_xa2_admin_users_exit_multiselect = /** @type {(inputs: Admin_Users_Exit_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càncèl sèlèctìòn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Cancel selection" |
*
* @param {Admin_Users_Exit_MultiselectInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_exit_multiselect = /** @type {((inputs?: Admin_Users_Exit_MultiselectInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Exit_MultiselectInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_exit_multiselect(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_exit_multiselect(inputs)
	return en_admin_users_exit_multiselect(inputs)
});