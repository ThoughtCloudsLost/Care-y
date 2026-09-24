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

const en_xa2_escalation_delete_confirm_title = /** @type {(inputs: Escalation_Delete_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè thìs àlèrt? ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete this alert?" |
*
* @param {Escalation_Delete_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_delete_confirm_title = /** @type {((inputs?: Escalation_Delete_Confirm_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Delete_Confirm_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_delete_confirm_title(inputs)
	if (locale === "en-XA") return en_xa2_escalation_delete_confirm_title(inputs)
	return en_escalation_delete_confirm_title(inputs)
});