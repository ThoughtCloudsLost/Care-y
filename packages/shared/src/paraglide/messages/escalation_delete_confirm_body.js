/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ rule: NonNullable<unknown> }} Escalation_Delete_Confirm_BodyInputs */

const en_escalation_delete_confirm_body = /** @type {(inputs: Escalation_Delete_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`The rule "${i?.rule}" will be removed permanently.`)
};

const es_escalation_delete_confirm_body = /** @type {(inputs: Escalation_Delete_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`La regla "${i?.rule}" será eliminada permanentemente.`)
};

/**
* | output |
* | --- |
* | "The rule \"{rule}\" will be removed permanently." |
*
* @param {Escalation_Delete_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_delete_confirm_body = /** @type {((inputs: Escalation_Delete_Confirm_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Delete_Confirm_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_delete_confirm_body(inputs)
	return es_escalation_delete_confirm_body(inputs)
});