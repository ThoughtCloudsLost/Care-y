/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Logs_DescInputs */

const en_demo_section_admin_logs_desc = /** @type {(inputs: Demo_Section_Admin_Logs_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The logs page holds a call history tab and an audit log tab. Each tab lists plaintext metadata with one name per row that the browser decrypts from organization-key ciphertext. An account holding the View reports permission has access to the call history tab, and an account holding the View audit log permission has access to the audit tab. Either permission opens the page. Call history rows belong to tickets, so the retention purge deletes them with the ticket. [Call history](#admin-logs/calls) and [Audit log](#admin-logs/audit) cover each tab, and [Data retention](#deep-dive/data-retention) covers the purge.`)
};

const es_demo_section_admin_logs_desc = /** @type {(inputs: Demo_Section_Admin_Logs_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de registros tiene una pestaña de historial de llamadas y una pestaña de registro de auditoría. Cada pestaña muestra metadatos en texto plano con un nombre por fila que el navegador descifra a partir de texto cifrado con la clave de la organización. Una cuenta con el permiso Ver reportes tiene acceso a la pestaña de historial de llamadas, y una cuenta con el permiso Ver registro de auditoría tiene acceso a la pestaña de auditoría. Cualquiera de los dos permisos abre la página. Las filas del historial de llamadas pertenecen a tickets, de modo que la purga de retención las elimina junto con el ticket. [Historial de llamadas](#admin-logs/calls) y [Registro de auditoría](#admin-logs/audit) tratan cada pestaña, y [Retención de datos](#deep-dive/data-retention) trata la purga.`)
};

const en_xa2_demo_section_admin_logs_desc = /** @type {(inputs: Demo_Section_Admin_Logs_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè lògs pàgè hòlds à càll hìstòry tàb ànd àn àùdìt lòg tàb. Èàch tàb lìsts plàìntèxt mètàdàtà wìth ònè nàmè pèr ròw thàt thè bròwsèr dècrypts fròm òrgànìzàtìòn-kèy cìphèrtèxt. Àn àccòùnt hòldìng thè Vìèw rèpòrts pèrmìssìòn hàs àccèss tò thè càll hìstòry tàb, ànd àn àccòùnt hòldìng thè Vìèw àùdìt lòg pèrmìssìòn hàs àccèss tò thè àùdìt tàb. Èìthèr pèrmìssìòn òpèns thè pàgè. Càll hìstòry ròws bèlòng tò tìckèts, sò thè rètèntìòn pùrgè dèlètès thèm wìth thè tìckèt. [Càll hìstòry](#àdmìn-lògs/càlls) ànd [Àùdìt lòg](#àdmìn-lògs/àùdìt) còvèr èàch tàb, ànd [Dàtà rètèntìòn](#dèèp-dìvè/dàtà-rètèntìòn) còvèrs thè pùrgè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The logs page holds a call history tab and an audit log tab. Each tab lists plaintext metadata with one name per row that the browser decrypts from organizat..." |
*
* @param {Demo_Section_Admin_Logs_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_logs_desc = /** @type {((inputs?: Demo_Section_Admin_Logs_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Logs_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_logs_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_admin_logs_desc(inputs)
	return en_demo_section_admin_logs_desc(inputs)
});