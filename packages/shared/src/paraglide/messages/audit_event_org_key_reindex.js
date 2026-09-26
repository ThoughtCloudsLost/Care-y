/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Org_Key_ReindexInputs */

const en_audit_event_org_key_reindex = /** @type {(inputs: Audit_Event_Org_Key_ReindexInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Record index rebuilt`)
};

const es_audit_event_org_key_reindex = /** @type {(inputs: Audit_Event_Org_Key_ReindexInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Índice de registros reconstruido`)
};

const en_xa2_audit_event_org_key_reindex = /** @type {(inputs: Audit_Event_Org_Key_ReindexInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòrd ìndèx rèbùìlt ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Record index rebuilt" |
*
* @param {Audit_Event_Org_Key_ReindexInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_org_key_reindex = /** @type {((inputs?: Audit_Event_Org_Key_ReindexInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Org_Key_ReindexInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_org_key_reindex(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_org_key_reindex(inputs)
	return en_audit_event_org_key_reindex(inputs)
});