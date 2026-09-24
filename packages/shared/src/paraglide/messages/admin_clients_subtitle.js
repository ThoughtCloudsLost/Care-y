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

const en_xa2_admin_clients_subtitle = /** @type {(inputs: Admin_Clients_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Bròwsè ànd mànàgè  ••••••${i?.client} rècòrds •••⟧`)
};

/**
* | output |
* | --- |
* | "Browse and manage {client} records" |
*
* @param {Admin_Clients_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_clients_subtitle = /** @type {((inputs: Admin_Clients_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Clients_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_clients_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_admin_clients_subtitle(inputs)
	return en_admin_clients_subtitle(inputs)
});