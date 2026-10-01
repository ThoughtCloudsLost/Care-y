/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Funds_IncompleteInputs */

const en_funds_incomplete = /** @type {(inputs: Funds_IncompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Some entries could not be read, so these balances may be incomplete.`)
};

const es_funds_incomplete = /** @type {(inputs: Funds_IncompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Algunos movimientos no se pudieron leer, así que estos saldos pueden estar incompletos.`)
};

const en_xa2_funds_incomplete = /** @type {(inputs: Funds_IncompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòmè èntrìès còùld nòt bè rèàd, sò thèsè bàlàncès mày bè ìncòmplètè. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Some entries could not be read, so these balances may be incomplete." |
*
* @param {Funds_IncompleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const funds_incomplete = /** @type {((inputs?: Funds_IncompleteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Funds_IncompleteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_funds_incomplete(inputs)
	if (locale === "en-XA") return en_xa2_funds_incomplete(inputs)
	return en_funds_incomplete(inputs)
});