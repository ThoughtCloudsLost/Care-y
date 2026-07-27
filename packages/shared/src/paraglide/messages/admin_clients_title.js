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

/**
* | output |
* | --- |
* | "{Clients}" |
*
* @param {Admin_Clients_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_clients_title = /** @type {((inputs: Admin_Clients_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Clients_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_clients_title(inputs)
	return es_admin_clients_title(inputs)
});