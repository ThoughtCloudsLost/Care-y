/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_EscalationInputs */

const en_permission_manage_escalation = /** @type {(inputs: Permission_Manage_EscalationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage escalation`)
};

const es_permission_manage_escalation = /** @type {(inputs: Permission_Manage_EscalationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar escalamiento`)
};

const en_xa2_permission_manage_escalation = /** @type {(inputs: Permission_Manage_EscalationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè èscàlàtìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage escalation" |
*
* @param {Permission_Manage_EscalationInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_escalation = /** @type {((inputs?: Permission_Manage_EscalationInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_EscalationInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_escalation(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_escalation(inputs)
	return en_permission_manage_escalation(inputs)
});