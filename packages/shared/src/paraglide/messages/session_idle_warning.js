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

const en_xa2_session_idle_warning = /** @type {(inputs: Session_Idle_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèssìòn wìll lòck ìn 5 mìnùtès dùè tò ìnàctìvìty •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Session will lock in 5 minutes due to inactivity" |
*
* @param {Session_Idle_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const session_idle_warning = /** @type {((inputs?: Session_Idle_WarningInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Session_Idle_WarningInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_session_idle_warning(inputs)
	if (locale === "en-XA") return en_xa2_session_idle_warning(inputs)
	return en_session_idle_warning(inputs)
});