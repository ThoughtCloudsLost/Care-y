/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_Client_RecordsInputs */

const en_roles_group_client_records = /** @type {(inputs: Roles_Group_Client_RecordsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Client records`)
};

const es_roles_group_client_records = /** @type {(inputs: Roles_Group_Client_RecordsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registros de clientes`)
};

const en_xa2_roles_group_client_records = /** @type {(inputs: Roles_Group_Client_RecordsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clìènt rècòrds •••••⟧`)
};

/**
* | output |
* | --- |
* | "Client records" |
*
* @param {Roles_Group_Client_RecordsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_group_client_records = /** @type {((inputs?: Roles_Group_Client_RecordsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_Client_RecordsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_client_records(inputs)
	if (locale === "en-XA") return en_xa2_roles_group_client_records(inputs)
	return en_roles_group_client_records(inputs)
});