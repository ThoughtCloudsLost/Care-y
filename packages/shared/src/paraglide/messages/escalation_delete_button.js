/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Delete_ButtonInputs */

const en_escalation_delete_button = /** @type {(inputs: Escalation_Delete_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete`)
};

const es_escalation_delete_button = /** @type {(inputs: Escalation_Delete_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar`)
};

const en_xa2_escalation_delete_button = /** @type {(inputs: Escalation_Delete_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè ••⟧`)
};

/**
* | output |
* | --- |
* | "Delete" |
*
* @param {Escalation_Delete_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_delete_button = /** @type {((inputs?: Escalation_Delete_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Delete_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_delete_button(inputs)
	if (locale === "en-XA") return en_xa2_escalation_delete_button(inputs)
	return en_escalation_delete_button(inputs)
});