/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Logs_DescInputs */

const en_demo_section_admin_logs_desc = /** @type {(inputs: Demo_Section_Admin_Logs_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Both tabs on the logs page show plaintext metadata with a single decrypted name per row. The View reports permission gates the page, and the View audit log permission gates the audit tab within it.`)
};

const es_demo_section_admin_logs_desc = /** @type {(inputs: Demo_Section_Admin_Logs_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ambas pestañas de la página de registros muestran metadatos en texto plano con un solo nombre descifrado por fila. El permiso Ver reportes y estadísticas controla el acceso a la página, y el permiso Leer el registro de auditoría controla la pestaña de auditoría dentro de ella.`)
};

/**
* | output |
* | --- |
* | "Both tabs on the logs page show plaintext metadata with a single decrypted name per row. The View reports permission gates the page, and the View audit log p..." |
*
* @param {Demo_Section_Admin_Logs_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_logs_desc = /** @type {((inputs?: Demo_Section_Admin_Logs_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Logs_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_logs_desc(inputs)
	return en_demo_section_admin_logs_desc(inputs)
});