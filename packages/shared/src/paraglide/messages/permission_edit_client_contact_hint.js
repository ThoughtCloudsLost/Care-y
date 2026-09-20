/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Edit_Client_Contact_HintInputs */

const en_permission_edit_client_contact_hint = /** @type {(inputs: Permission_Edit_Client_Contact_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Applies to contact details on any client record, not only your own cases.`)
};

const es_permission_edit_client_contact_hint = /** @type {(inputs: Permission_Edit_Client_Contact_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se aplica a los datos de contacto de cualquier cliente, no solo los de sus propios casos.`)
};

/**
* | output |
* | --- |
* | "Applies to contact details on any client record, not only your own cases." |
*
* @param {Permission_Edit_Client_Contact_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_edit_client_contact_hint = /** @type {((inputs?: Permission_Edit_Client_Contact_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Edit_Client_Contact_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_edit_client_contact_hint(inputs)
	return en_permission_edit_client_contact_hint(inputs)
});