/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ rule: NonNullable<unknown> }} Escalation_Delete_AriaInputs */

const en_escalation_delete_aria = /** @type {(inputs: Escalation_Delete_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Delete rule: ${i?.rule}`)
};

const es_escalation_delete_aria = /** @type {(inputs: Escalation_Delete_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Eliminar regla: ${i?.rule}`)
};

const en_xa2_escalation_delete_aria = /** @type {(inputs: Escalation_Delete_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè rùlè:  ••••${i?.rule}⟧`)
};

/**
* | output |
* | --- |
* | "Delete rule: {rule}" |
*
* @param {Escalation_Delete_AriaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_delete_aria = /** @type {((inputs: Escalation_Delete_AriaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Delete_AriaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_delete_aria(inputs)
	if (locale === "en-XA") return en_xa2_escalation_delete_aria(inputs)
	return en_escalation_delete_aria(inputs)
});