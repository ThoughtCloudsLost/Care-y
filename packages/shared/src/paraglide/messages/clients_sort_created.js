/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Clients_Sort_CreatedInputs */

const en_clients_sort_created = /** @type {(inputs: Clients_Sort_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date created`)
};

const es_clients_sort_created = /** @type {(inputs: Clients_Sort_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fecha de creacion`)
};

/**
* | output |
* | --- |
* | "Date created" |
*
* @param {Clients_Sort_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_sort_created = /** @type {((inputs?: Clients_Sort_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Sort_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_sort_created(inputs)
	return es_clients_sort_created(inputs)
});