/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Notifications_HeadingInputs */

const en_demo_narrative_settings_notifications_heading = /** @type {(inputs: Demo_Narrative_Settings_Notifications_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notification preferences`)
};

const es_demo_narrative_settings_notifications_heading = /** @type {(inputs: Demo_Narrative_Settings_Notifications_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preferencias de notificaciones`)
};

const en_xa2_demo_narrative_settings_notifications_heading = /** @type {(inputs: Demo_Narrative_Settings_Notifications_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtìfìcàtìòn prèfèrèncès ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Notification preferences" |
*
* @param {Demo_Narrative_Settings_Notifications_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_notifications_heading = /** @type {((inputs?: Demo_Narrative_Settings_Notifications_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Notifications_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_notifications_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_notifications_heading(inputs)
	return en_demo_narrative_settings_notifications_heading(inputs)
});