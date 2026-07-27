/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Clients: NonNullable<unknown> }} Clients_Page_TitleInputs */

const en_clients_page_title = /** @type {(inputs: Clients_Page_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Clients}`)
};

const es_clients_page_title = /** @type {(inputs: Clients_Page_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Clients}`)
};

/**
* | output |
* | --- |
* | "{Clients}" |
*
* @param {Clients_Page_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_page_title = /** @type {((inputs: Clients_Page_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Page_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_page_title(inputs)
	return es_clients_page_title(inputs)
});