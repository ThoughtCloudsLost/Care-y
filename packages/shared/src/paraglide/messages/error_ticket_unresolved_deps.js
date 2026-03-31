/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Ticket_Unresolved_DepsInputs */

const en_error_ticket_unresolved_deps = /** @type {(inputs: Error_Ticket_Unresolved_DepsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cannot close ticket with unresolved dependencies.`)
};

const es_error_ticket_unresolved_deps = /** @type {(inputs: Error_Ticket_Unresolved_DepsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se puede cerrar el ticket con dependencias sin resolver.`)
};

/**
* | output |
* | --- |
* | "Cannot close ticket with unresolved dependencies." |
*
* @param {Error_Ticket_Unresolved_DepsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_unresolved_deps = /** @type {((inputs?: Error_Ticket_Unresolved_DepsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Unresolved_DepsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_ticket_unresolved_deps(inputs)
	return es_error_ticket_unresolved_deps(inputs)
});