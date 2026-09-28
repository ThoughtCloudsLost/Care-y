/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Intake_DescInputs */

const en_demo_section_client_intake_desc = /** @type {(inputs: Demo_Section_Client_Intake_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The intake form is where someone without an account asks for help. A built-in default ships with every organization, and custom forms can replace it with different fields and destination queues. Field labels, messages and banner images are readable by anyone who opens the form's public address. The answers a visitor types are encrypted in the browser under a per-case key the server cannot derive. [How encryption works](#deep-dive/how-encryption-works) covers the two key trees, and [How the visitor is protected](#client-intake/how-protected) covers what the server is left with after a submission.`)
};

const es_demo_section_client_intake_desc = /** @type {(inputs: Demo_Section_Client_Intake_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El formulario de admisión es donde alguien sin cuenta solicita ayuda. Cada organización incluye un formulario predeterminado, y los formularios personalizados pueden reemplazarlo con campos y colas de destino diferentes. Las etiquetas de campo, los mensajes y las imágenes de banner son legibles para cualquier persona que abra la dirección pública del formulario. Las respuestas que el visitante escribe se cifran en el navegador con una clave por caso que el servidor no puede derivar. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata los dos árboles de claves, y [Cómo se protege al visitante](#client-intake/how-protected) trata lo que le queda al servidor tras un envío.`)
};

const en_xa2_demo_section_client_intake_desc = /** @type {(inputs: Demo_Section_Client_Intake_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ìntàkè fòrm ìs whèrè sòmèònè wìthòùt àn àccòùnt àsks fòr hèlp. À bùìlt-ìn dèfàùlt shìps wìth èvèry òrgànìzàtìòn, ànd cùstòm fòrms càn rèplàcè ìt wìth dìffèrènt fìèlds ànd dèstìnàtìòn qùèùès. Fìèld làbèls, mèssàgès ànd bànnèr ìmàgès àrè rèàdàblè by ànyònè whò òpèns thè fòrm's pùblìc àddrèss. Thè ànswèrs à vìsìtòr typès àrè èncryptèd ìn thè bròwsèr ùndèr à pèr-càsè kèy thè sèrvèr cànnòt dèrìvè. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè twò kèy trèès, ànd [Hòw thè vìsìtòr ìs pròtèctèd](#clìènt-ìntàkè/hòw-pròtèctèd) còvèrs whàt thè sèrvèr ìs lèft wìth àftèr à sùbmìssìòn. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The intake form is where someone without an account asks for help. A built-in default ships with every organization, and custom forms can replace it with dif..." |
*
* @param {Demo_Section_Client_Intake_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_intake_desc = /** @type {((inputs?: Demo_Section_Client_Intake_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Intake_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_intake_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_client_intake_desc(inputs)
	return en_demo_section_client_intake_desc(inputs)
});