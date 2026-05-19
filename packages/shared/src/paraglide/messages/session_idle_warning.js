/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Session_Idle_WarningInputs */

const en_session_idle_warning = /** @type {(inputs: Session_Idle_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Session will lock in 5 minutes due to inactivity`)
};

const es_session_idle_warning = /** @type {(inputs: Session_Idle_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sesión se bloqueará en 5 minutos por inactividad`)
};

/**
* | output |
* | --- |
* | "Session will lock in 5 minutes due to inactivity" |
*
* @param {Session_Idle_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const session_idle_warning = /** @type {((inputs?: Session_Idle_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Session_Idle_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_session_idle_warning(inputs)
	return es_session_idle_warning(inputs)
});