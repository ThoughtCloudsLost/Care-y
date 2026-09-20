/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Clients: NonNullable<unknown> }} Admin_Clients_TitleInputs */

const en_admin_clients_title = /** @type {(inputs: Admin_Clients_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Clients}`)
};

const es_admin_clients_title = /** @type {(inputs: Admin_Clients_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Clients}`)
};

const en_xa2_admin_clients_title = /** @type {(inputs: Admin_Clients_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Clients}⟧`)
};

/**
* | output |
* | --- |
* | "{Clients}" |
*
* @param {Admin_Clients_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_clients_title = /** @type {((inputs: Admin_Clients_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Clients_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_clients_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_clients_title(inputs)
	return en_admin_clients_title(inputs)
});