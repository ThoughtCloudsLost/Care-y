/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_Queue_RoutingInputs */

const en_intake_forms_config_role_queue_routing = /** @type {(inputs: Intake_Forms_Config_Role_Queue_RoutingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue routing`)
};

const es_intake_forms_config_role_queue_routing = /** @type {(inputs: Intake_Forms_Config_Role_Queue_RoutingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enrutamiento de cola`)
};

const en_xa2_intake_forms_config_role_queue_routing = /** @type {(inputs: Intake_Forms_Config_Role_Queue_RoutingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Qùèùè ròùtìng ••••⟧`)
};

/**
* | output |
* | --- |
* | "Queue routing" |
*
* @param {Intake_Forms_Config_Role_Queue_RoutingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_queue_routing = /** @type {((inputs?: Intake_Forms_Config_Role_Queue_RoutingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_Queue_RoutingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_role_queue_routing(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_role_queue_routing(inputs)
	return en_intake_forms_config_role_queue_routing(inputs)
});