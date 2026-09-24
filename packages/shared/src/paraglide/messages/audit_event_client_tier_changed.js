/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown>, client: NonNullable<unknown> }} Audit_Event_Client_Tier_ChangedInputs */

const en_audit_event_client_tier_changed = /** @type {(inputs: Audit_Event_Client_Tier_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} communication tier changed`)
};

const es_audit_event_client_tier_changed = /** @type {(inputs: Audit_Event_Client_Tier_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Nivel de comunicación de ${i?.client} cambiado`)
};

const en_xa2_audit_event_client_tier_changed = /** @type {(inputs: Audit_Event_Client_Tier_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Client} còmmùnìcàtìòn tìèr chàngèd •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "{Client} communication tier changed" |
*
* @param {Audit_Event_Client_Tier_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_tier_changed = /** @type {((inputs: Audit_Event_Client_Tier_ChangedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Client_Tier_ChangedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_client_tier_changed(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_client_tier_changed(inputs)
	return en_audit_event_client_tier_changed(inputs)
});