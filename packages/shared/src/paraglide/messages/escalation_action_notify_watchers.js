/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Action_Notify_WatchersInputs */

const en_escalation_action_notify_watchers = /** @type {(inputs: Escalation_Action_Notify_WatchersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notify queue watchers`)
};

const es_escalation_action_notify_watchers = /** @type {(inputs: Escalation_Action_Notify_WatchersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notificar observadores de cola`)
};

/**
* | output |
* | --- |
* | "Notify queue watchers" |
*
* @param {Escalation_Action_Notify_WatchersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_action_notify_watchers = /** @type {((inputs?: Escalation_Action_Notify_WatchersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Action_Notify_WatchersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_action_notify_watchers(inputs)
	return es_escalation_action_notify_watchers(inputs)
});