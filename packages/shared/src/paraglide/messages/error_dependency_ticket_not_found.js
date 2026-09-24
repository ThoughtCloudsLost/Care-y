/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown>, Ticket: NonNullable<unknown> }} Error_Dependency_Ticket_Not_FoundInputs */

const en_error_dependency_ticket_not_found = /** @type {(inputs: Error_Dependency_Ticket_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Dependency ${i?.ticket} not found.`)
};

const es_error_dependency_ticket_not_found = /** @type {(inputs: Error_Dependency_Ticket_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} de dependencia no encontrado.`)
};

const en_xa2_error_dependency_ticket_not_found = /** @type {(inputs: Error_Dependency_Ticket_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dèpèndèncy  ••••${i?.ticket} nòt fòùnd. ••••⟧`)
};

/**
* | output |
* | --- |
* | "Dependency {ticket} not found." |
*
* @param {Error_Dependency_Ticket_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_dependency_ticket_not_found = /** @type {((inputs: Error_Dependency_Ticket_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Dependency_Ticket_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_dependency_ticket_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_dependency_ticket_not_found(inputs)
	return en_error_dependency_ticket_not_found(inputs)
});