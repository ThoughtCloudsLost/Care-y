/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Dependency_Ticket_Not_FoundInputs */

const en_error_dependency_ticket_not_found = /** @type {(inputs: Error_Dependency_Ticket_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dependency ticket not found.`)
};

const es_error_dependency_ticket_not_found = /** @type {(inputs: Error_Dependency_Ticket_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket de dependencia no encontrado.`)
};

/**
* | output |
* | --- |
* | "Dependency ticket not found." |
*
* @param {Error_Dependency_Ticket_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_dependency_ticket_not_found = /** @type {((inputs?: Error_Dependency_Ticket_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Dependency_Ticket_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_dependency_ticket_not_found(inputs)
	return es_error_dependency_ticket_not_found(inputs)
});