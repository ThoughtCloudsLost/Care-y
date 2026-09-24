/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ clients: NonNullable<unknown> }} Clients_Empty_StateInputs */

const en_clients_empty_state = /** @type {(inputs: Clients_Empty_StateInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No ${i?.clients} found`)
};

const es_clients_empty_state = /** @type {(inputs: Clients_Empty_StateInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se encontraron ${i?.clients}`)
};

const en_xa2_clients_empty_state = /** @type {(inputs: Clients_Empty_StateInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nò  •${i?.clients} fòùnd ••⟧`)
};

/**
* | output |
* | --- |
* | "No {clients} found" |
*
* @param {Clients_Empty_StateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_empty_state = /** @type {((inputs: Clients_Empty_StateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Empty_StateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_clients_empty_state(inputs)
	if (locale === "en-XA") return en_xa2_clients_empty_state(inputs)
	return en_clients_empty_state(inputs)
});