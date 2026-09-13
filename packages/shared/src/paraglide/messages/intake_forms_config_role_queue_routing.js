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

/**
* | output |
* | --- |
* | "Queue routing" |
*
* @param {Intake_Forms_Config_Role_Queue_RoutingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_queue_routing = /** @type {((inputs?: Intake_Forms_Config_Role_Queue_RoutingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_Queue_RoutingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_role_queue_routing(inputs)
	return es_intake_forms_config_role_queue_routing(inputs)
});