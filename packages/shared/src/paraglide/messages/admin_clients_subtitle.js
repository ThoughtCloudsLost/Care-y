/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Admin_Clients_SubtitleInputs */

const en_admin_clients_subtitle = /** @type {(inputs: Admin_Clients_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Browse and manage ${i?.client} records`)
};

const es_admin_clients_subtitle = /** @type {(inputs: Admin_Clients_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Explorar y gestionar registros de ${i?.client}`)
};

/**
* | output |
* | --- |
* | "Browse and manage {client} records" |
*
* @param {Admin_Clients_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_clients_subtitle = /** @type {((inputs: Admin_Clients_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Clients_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_clients_subtitle(inputs)
	return es_admin_clients_subtitle(inputs)
});