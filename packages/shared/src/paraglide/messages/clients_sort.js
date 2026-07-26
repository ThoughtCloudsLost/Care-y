/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ clients: NonNullable<unknown> }} Clients_SortInputs */

const en_clients_sort = /** @type {(inputs: Clients_SortInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Sort ${i?.clients}`)
};

const es_clients_sort = /** @type {(inputs: Clients_SortInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ordenar ${i?.clients}`)
};

/**
* | output |
* | --- |
* | "Sort {clients}" |
*
* @param {Clients_SortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_sort = /** @type {((inputs: Clients_SortInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_SortInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_sort(inputs)
	return es_clients_sort(inputs)
});