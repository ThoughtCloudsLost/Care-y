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

/**
* | output |
* | --- |
* | "Client records" |
*
* @param {Roles_Group_Client_RecordsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_client_records = /** @type {((inputs?: Roles_Group_Client_RecordsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_Client_RecordsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_client_records(inputs)
	return en_roles_group_client_records(inputs)
});