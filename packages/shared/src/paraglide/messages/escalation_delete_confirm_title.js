/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Delete_Confirm_TitleInputs */

const en_escalation_delete_confirm_title = /** @type {(inputs: Escalation_Delete_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete this alert?`)
};

const es_escalation_delete_confirm_title = /** @type {(inputs: Escalation_Delete_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Eliminar esta alerta?`)
};

/**
* | output |
* | --- |
* | "Delete this alert?" |
*
* @param {Escalation_Delete_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_delete_confirm_title = /** @type {((inputs?: Escalation_Delete_Confirm_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Delete_Confirm_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_delete_confirm_title(inputs)
	return es_escalation_delete_confirm_title(inputs)
});