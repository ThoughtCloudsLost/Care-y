/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Error_Ticket_Unresolved_DepsInputs */

const en_error_ticket_unresolved_deps = /** @type {(inputs: Error_Ticket_Unresolved_DepsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cannot close ${i?.ticket} with unresolved dependencies.`)
};

const es_error_ticket_unresolved_deps = /** @type {(inputs: Error_Ticket_Unresolved_DepsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se puede cerrar el ${i?.ticket} con dependencias sin resolver.`)
};

const en_xa2_error_ticket_unresolved_deps = /** @type {(inputs: Error_Ticket_Unresolved_DepsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Cànnòt clòsè  ••••${i?.ticket} wìth ùnrèsòlvèd dèpèndèncìès. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Cannot close {ticket} with unresolved dependencies." |
*
* @param {Error_Ticket_Unresolved_DepsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_ticket_unresolved_deps = /** @type {((inputs: Error_Ticket_Unresolved_DepsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Unresolved_DepsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_ticket_unresolved_deps(inputs)
	if (locale === "en-XA") return en_xa2_error_ticket_unresolved_deps(inputs)
	return en_error_ticket_unresolved_deps(inputs)
});