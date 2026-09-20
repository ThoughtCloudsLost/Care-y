/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Action_Notify_ManagersInputs */

const en_escalation_action_notify_managers = /** @type {(inputs: Escalation_Action_Notify_ManagersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notify managers`)
};

const es_escalation_action_notify_managers = /** @type {(inputs: Escalation_Action_Notify_ManagersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notificar administradores`)
};

const en_xa2_escalation_action_notify_managers = /** @type {(inputs: Escalation_Action_Notify_ManagersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtìfy mànàgèrs •••••⟧`)
};

/**
* | output |
* | --- |
* | "Notify managers" |
*
* @param {Escalation_Action_Notify_ManagersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_action_notify_managers = /** @type {((inputs?: Escalation_Action_Notify_ManagersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Action_Notify_ManagersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_action_notify_managers(inputs)
	if (locale === "en-XA") return en_xa2_escalation_action_notify_managers(inputs)
	return en_escalation_action_notify_managers(inputs)
});